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
  outputPath = locateCache('sdk.ts')
) {
  debug(`called with:`, { schemaPattern, documentsPattern, outputPath })

  await push(await schemaPattern)
  const schema = await pull()

  debug(`Generating TypeScript SDK`)
  const sdk = await generateSdk(schema, await documentsPattern)

  const ouput = `${sdk}

export default function faugra({
  secret = process.env.FAUGRA_SECRET,
  endpoint = process.env.FAUGRA_ENDPOINT,
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

  if (outputPath) {
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(outputPath, ouput)
    debug(`The sdk has been saved at '${outputPath}'`)

    execa.sync(findBin(`tsc`), [outputPath, '--declaration', '--declarationMap'], {
      stdio: ['pipe', process.stdout, process.stderr],
      cwd: process.cwd(),
    })
    debug(`The sdk has been transpiled in place`)
  }

  return ouput
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [schemaPattern, documentsPattern, outputPath] = process.argv.slice(2)

  main(
    schemaPattern === '-' ? pipeData() : schemaPattern,
    documentsPattern === '-' ? pipeData() : documentsPattern,
    outputPath
  )
    .then((sdk) => {
      if (!outputPath) {
        console.log(sdk)
      }

      process.exit(0)
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
