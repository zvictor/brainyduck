const fs = require('fs')
const path = require('path')
const debug = require('debug')
const tempy = require('tempy')
const globby = require('globby')
const fetch = require('node-fetch')
const { performance } = require('perf_hooks')
const faunaEval = require('fauna-shell/src/commands/eval')
const { parseGraphQLSDL } = require('@graphql-tools/utils')
const { isExecutableDefinitionNode, Kind } = require('graphql')
const { processImport } = require('@graphql-tools/import')
const { mergeTypeDefs } = require('@graphql-tools/merge')
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader')

const baseSchemaPath = path.resolve(path.join(__dirname, './base.gql'))
const baseSchema = fs.readFileSync(baseSchemaPath).toString('utf8')
const { FAUGRA_DOMAIN = 'https://graphql.fauna.com' } = process.env

const ignored = process.env.FAUGRA_IGNORE
  ? process.env.FAUGRA_IGNORE.split(',')
  : ['**/node_modules/**', '**/.git/**']

const loadSecret = () => {
  const secret = process.env.FAUGRA_SECRET

  if (!secret) {
    console.error(
      `The faugra secret is missing! 🤷‍🥚\n\nPlease define a secret to get started. 💁🐣\n ↳ read more on https://github.com/zvictor/faugra/wiki/Faugra-secret\n`
    )

    throw new Error(`missing faugra's secret`)
  }

  return secret
}

const patternMatch = (pattern) =>
  globby(pattern, {
    cwd: process.cwd(),
    ignore: ignored,
  })

const locateCache = (file) => path.join(__dirname, '.cache/', file)

const runFQL = async (query) => {
  // runFQL is needed because otherwise we can't easily store the ouput of faunaEval in a variable.
  // "killing a fly with a bazooka" here.

  debug('faugra:runFQL')(`Executing query:\n${query}`)

  const tmpFile = tempy.file()
  await faunaEval.run([query, '--secret', loadSecret(), '--output', tmpFile])

  debug('faugra:runFQL')(`The query has been executed`)

  // temporary fix for https://github.com/fauna/fauna-shell/pull/61
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(tmpFile)
    const chunks = []

    stream.on('error', reject)
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('end', () => {
      const data = JSON.parse(Buffer.concat(chunks).toString('utf8'))

      resolve(data)
    })
  })
}

const importSchema = async (schema, override) => {
  debug('faugra:importSchema')(
    `Pushing the schema to ${FAUGRA_DOMAIN}/import in ${override ? 'OVERRIDE' : 'NORMAL'} mode`
  )

  const t0 = performance.now()
  const response = await fetch(`${FAUGRA_DOMAIN}/import${override ? '?mode=override' : ''}`, {
    method: 'POST',
    body: schema,
    headers: new fetch.Headers({
      Authorization: `Bearer ${loadSecret()}`,
    }),
  })
  debug('faugra:importSchema')(`The call to fauna took ${performance.now() - t0} milliseconds.`)

  const message = await response.text()
  if (response.status !== 200) {
    throw new Error(message)
  }

  return message
}

const pipeData = new Promise((resolve, reject) => {
  const stdin = process.openStdin()
  let data = ''

  stdin.on('data', function (chunk) {
    data += chunk
  })

  stdin.on('error', function (e) {
    reject(e)
  })

  stdin.on('end', function () {
    resolve(data)
  })
})

function isGraphQLImportFile(rawSDL) {
  const trimmedRawSDL = rawSDL.trim()
  return trimmedRawSDL.startsWith('# import') || trimmedRawSDL.startsWith('#import')
}

class FaugraSchemaLoader extends GraphQLFileLoader {
  // Copied from https://github.com/ardatan/graphql-tools/blob/46c5700a5d60012ea96dea6201ac9b8e426a1942/packages/loaders/graphql-file/src/index.ts#L100
  // The whole method is copied just so that we can insert a cache object in the `processImport` call (check its third argument).
  // With this change we are able to provide the fauna's scalars and directives (base.gql) with a `import * from "faugra"` statement.

  handleFileContent(rawSDL, pointer, options) {
    if (!options.skipGraphQLImport && isGraphQLImportFile(rawSDL)) {
      // the only change made to the method is down below: {         👇         }
      const document = processImport(pointer, options.cwd, { faugra: baseSchema })
      const typeSystemDefinitions = document.definitions
        .filter((d) => !isExecutableDefinitionNode(d))
        .map((definition) => ({
          kind: Kind.DOCUMENT,
          definitions: [definition],
        }))
      const mergedTypeDefs = mergeTypeDefs(typeSystemDefinitions, { useSchemaDefinition: false })
      const executableDefinitions = document.definitions.filter(isExecutableDefinitionNode)
      return {
        location: pointer,
        document: {
          ...mergedTypeDefs,
          definitions: [...mergedTypeDefs.definitions, ...executableDefinitions],
        },
      }
    }

    return parseGraphQLSDL(pointer, rawSDL, options)
  }
}

module.exports = {
  baseSchema,
  ignored,
  loadSecret,
  patternMatch,
  locateCache,
  runFQL,
  importSchema,
  pipeData,
  FaugraSchemaLoader,
}
