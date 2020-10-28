const fs = require('fs')
const path = require('path')
const globby = require('globby')
const findCacheDir = require('find-cache-dir')
const { parseGraphQLSDL } = require('@graphql-tools/utils')
const { isExecutableDefinitionNode, Kind } = require('graphql')
const { processImport } = require('@graphql-tools/import')
const { mergeTypeDefs } = require('@graphql-tools/merge')
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader')

const baseSchemaPath = path.resolve(path.join(__dirname, './base.gql'))
const baseSchema = fs.readFileSync(baseSchemaPath).toString('utf8')

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

const locateCache = findCacheDir({ name: 'faugra', thunk: true })

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
  pipeData,
  FaugraSchemaLoader,
}
