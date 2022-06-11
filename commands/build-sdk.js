#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import execa from 'execa'
import _debug from 'debug'
import { parse } from 'graphql'
import { fileURLToPath } from 'url'
import { codegen } from '@graphql-codegen/core'
import * as typescriptPlugin from '@graphql-codegen/typescript'
import * as typescriptOperations from '@graphql-codegen/typescript-operations'
import * as typescriptGraphqlRequest from '@graphql-codegen/typescript-graphql-request'
import { findBin, pipeData, patternMatch, locateCache } from '../utils.js'
import push from './push-schema.js'
import pull from './pull-schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const debug = _debug('faugra:build-sdk')

const config = {
  filename: 'output.ts',
  plugins: [
    // Each plugin should be an object
    {
      typescript: {}, // Here you can pass configuration to the plugin
    },
    { ['typescript-operations']: {} },
    {
      ['typescript-graphql-request']: {},
    },
  ],
  pluginMap: {
    typescript: typescriptPlugin,
    ['typescript-operations']: typescriptOperations,
    ['typescript-graphql-request']: typescriptGraphqlRequest,
  },
}

const generateSdk = async (schema, documentsPattern) => {
  debug(`Looking for documents matching '${documentsPattern}'`)

  const documents = (
    await patternMatch(
      Array.isArray(documentsPattern) ? documentsPattern : documentsPattern.split(',')
    )
  ).map((x) => ({
    location: x,
    document: parse(fs.readFileSync(path.resolve(x), 'utf8')),
  }))

  return await codegen({
    ...config,
    documents,
    schema: parse(schema),
  })
}

export default async function main(
  schemaPattern,
  documentsPattern = '**/[a-z]*.(graphql|gql)',
  outputFile = locateCache('sdk.ts'),
  transpile = true
) {
  debug(`called with:`, { schemaPattern, documentsPattern, outputFile })

  await push(await schemaPattern)
  const schema = await pull()

  debug(`Generating TypeScript SDK`)
  const sdk = await generateSdk(schema, await documentsPattern)

  const ouput = `${sdk}
export { Dom };

export default function faugra({
  secret = process?.env.FAUGRA_SECRET,
  endpoint = process?.env.FAUGRA_ENDPOINT,
} = {}) {
  if (!secret) {
    throw new Error('SDK requires a secret to be defined.')
  }

  return getSdk(
    new GraphQLClient(endpoint || 'https://graphql.fauna.com/graphql', {
      headers: {
        authorization: secret && \`Bearer \${secret}\`,
      },
    })
  )
}`

  if (!outputFile) {
    return ouput
  }

  const outputDir = path.dirname(outputFile)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputFile, ouput)
  debug(`The sdk has been copied to ${outputFile}`)

  if (!transpile) {
    return ouput
  }

  const tsconfigFile = process.env.FAUGRA_TSCONFIG || path.join(__dirname, '..', 'tsconfig.json')
  const tmpTsconfigFile = locateCache('tsconfig.json')

  debug(`Transpiling sdk with tsconfig at ${tsconfigFile}`)
  debug(`Caching files at ${locateCache()}`)

  if (!fs.existsSync(tsconfigFile)) {
    throw new Error(`The tsconfig file you specified does not exist.`)
  }

  if (!fs.existsSync(locateCache())) {
    fs.mkdirSync(locateCache(), { recursive: true })
  }

  // TODO This block would not be necessary if tsconfig allowed for absolute paths.
  // @see https://github.com/evanw/esbuild/issues/792
  if (
    process.env.FAUGRA_CACHE &&
    !fs.existsSync(path.join(process.env.FAUGRA_CACHE, 'node_modules'))
  ) {
    fs.symlinkSync(
      path.join(__dirname, '..', 'node_modules'),
      path.join(process.env.FAUGRA_CACHE, 'node_modules'),
      'dir'
    )
  }

  fs.writeFileSync(
    tmpTsconfigFile,
    `{"extends": "${tsconfigFile}", "include": ["${outputFile}"], "compilerOptions": {"outDir": "${locateCache()}"}}`
  )

  execa.sync(findBin(`tsc`), ['--project', tmpTsconfigFile], {
    stdio: ['pipe', process.stdout, process.stderr],
    cwd: process.cwd(),
  })

  debug(`The sdk has been transpiled and cached`)
  return outputFile
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [schemaPattern, documentsPattern, outputFile] = process.argv.slice(2)

  ;(async () => {
    const location = await main(
      schemaPattern === '-' ? pipeData() : schemaPattern,
      documentsPattern === '-' ? pipeData() : documentsPattern,
      outputFile
    )

    console.log(`The sdk has been saved at ${location}`)
  })()
}
