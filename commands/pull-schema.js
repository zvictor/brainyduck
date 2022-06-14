#!/usr/bin/env node
import fs from 'fs'
import _debug from 'debug'
import { print } from 'graphql'
import { performance } from 'perf_hooks'
import { fileURLToPath } from 'url'
import { loadTypedefs, OPERATION_KINDS } from '@graphql-tools/load'
import { UrlLoader } from '@graphql-tools/url-loader'
import { mergeTypeDefs } from '@graphql-tools/merge'
import { graphqlEndpoint, loadSecret } from '../utils.js'

const debug = _debug('faugra:pull-schema')

const loadSchema = async (
  url,
  ephemeralDB // temporary @see https://github.com/zvictor/faugra/issues/1
) => {
  debug(`Pulling the schema from '${url}'`)
  const options = {
    loaders: [new UrlLoader()],
    filterKinds: OPERATION_KINDS,
    sort: false,
    forceGraphQLImport: true,
    useSchemaDefinition: false,
    headers: {
      Authorization: `Bearer ${loadSecret(
        ephemeralDB // temporary @see https://github.com/zvictor/faugra/issues/1
      )}`,
    },
  }

  const typeDefs = await loadTypedefs(url, options).catch((err) => {
    if (
      err.message.includes('Must provide schema definition with query type or a type named Query.')
    ) {
      console.warn(`Please make sure you have pushed a valid schema before trying to pull it back.`)
      throw new Error(`Invalid schema retrieved: missing type Query`)
    }

    throw err
  })
  debug(`${typeDefs.length} typeDef(s) found`)

  if (!typeDefs || !typeDefs.length) {
    throw new Error('no schema found')
  }

  const mergedDocuments = print(
    mergeTypeDefs(
      typeDefs.map((r) => r.document),
      options
    )
  )

  return typeof mergedDocuments === 'string'
    ? mergedDocuments
    : mergedDocuments && print(mergedDocuments)
}

export default async function main(
  outputPath,
  ephemeralDB // temporary @see https://github.com/zvictor/faugra/issues/1
) {
  debug(`called with:`, { outputPath, ephemeralDB })
  const t0 = performance.now()
  const schema = await loadSchema(graphqlEndpoint.server, ephemeralDB)
  debug(`The call to fauna took ${performance.now() - t0} milliseconds.`)

  if (outputPath) {
    fs.writeFileSync(outputPath, schema)
    debug(`The schema has been stored at '${outputPath}'`)
  }

  return schema
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [outputPath] = process.argv.slice(2)

  ;(async () => {
    const schema = await main(
      outputPath && path.resolve(outputPath),
      process.env.FAUGRA_USE_EPHEMERAL_DB // temporary @see https://github.com/zvictor/faugra/issues/1
    )

    if (!outputPath) {
      console.log(schema)
    }
  })()
}
