#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const debug = require('debug')('pull-schema')
const { performance } = require('perf_hooks')
const { loadTypedefs, OPERATION_KINDS } = require('@graphql-toolkit/core')
const { UrlLoader } = require('@graphql-toolkit/url-loader')
const { print } = require('graphql')
const { mergeTypeDefs } = require('@graphql-toolkit/schema-merging')

const { FAUGRA_SECRET, FAUGRA_DOMAIN = 'https://graphql.fauna.com' } = process.env

const options = {
  loaders: [new UrlLoader()],
  filterKinds: OPERATION_KINDS,
  sort: false,
  forceGraphQLImport: true,
  useSchemaDefinition: false,
  headers: {
    Authorization: `Bearer ${FAUGRA_SECRET}`,
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
  const t0 = performance.now()
  const schema = await loadSchema(`${FAUGRA_DOMAIN}/graphql`)
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
