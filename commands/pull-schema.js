#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const debug = require('debug')('faugra:pull-schema')
const { performance } = require('perf_hooks')
const { loadTypedefs, OPERATION_KINDS } = require('@graphql-tools/load')
const { UrlLoader } = require('@graphql-tools/url-loader')
const { print } = require('graphql')
const { mergeTypeDefs } = require('@graphql-tools/merge')
const { graphqlEndpoint, loadSecret } = require('../utils')

const options = {
  loaders: [new UrlLoader()],
  filterKinds: OPERATION_KINDS,
  sort: false,
  forceGraphQLImport: true,
  useSchemaDefinition: false,
  headers: {
    Authorization: `Bearer ${loadSecret()}`,
  },
}

const loadSchema = async (url) => {
  debug(`Pulling the schema from '${url}'`)
  const typeDefs = await loadTypedefs(url, options)
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

const main = async (outputPath) => {
  debug(`called with:`, { outputPath })
  const t0 = performance.now()
  const schema = await loadSchema(graphqlEndpoint.server)
  debug(`The call to fauna took ${performance.now() - t0} milliseconds.`)

  if (outputPath) {
    fs.writeFileSync(outputPath, schema)
    debug(`The schema has been stored at '${outputPath}'`)
  }

  return schema
}

if (require.main === module) {
  const [outputPath] = process.argv.slice(2)

  return main(outputPath && path.resolve(outputPath))
    .then((schema) => {
      if (!outputPath) {
        console.log(schema)
      }

      process.exit(0)
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

module.exports = main
