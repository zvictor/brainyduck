#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const debug = require('debug')('push-schema')
const figures = require('figures')
const fetch = require('node-fetch')
const { performance } = require('perf_hooks')
const { loadTypedefs, OPERATION_KINDS } = require('@graphql-toolkit/core')
const { GraphQLFileLoader } = require('@graphql-toolkit/graphql-file-loader')
const { print } = require('graphql')
const { mergeTypeDefs } = require('@graphql-toolkit/schema-merging')
const { patternMatch } = require('../utils')

const { FAUGRA_SECRET, FAUGRA_DOMAIN = 'https://graphql.fauna.com' } = process.env
const basePath = path.resolve(path.join(__dirname, '../base.gql'))
const baseLines = fs.readFileSync(basePath).toString('utf8').split('\n')

const options = {
  loaders: [new GraphQLFileLoader()],
  filterKinds: OPERATION_KINDS,
  sort: false,
  forceGraphQLImport: true,
  useSchemaDefinition: false,
}

const loadSchema = async (pattern) => {
  debug(`Looking for schemas matching '${pattern}'`)

  const files = (
    await patternMatch(Array.isArray(pattern) ? pattern : pattern.split(','))
  ).map((x) => path.resolve(x))
  files.map((x) => debug(`\t${figures.pointer} found ${x}`))

  const typeDefs = await loadTypedefs([...files, basePath], options)

  const found = typeDefs.filter((x) => x.location !== basePath)
  if (!found.length) {
    throw new Error('no documents could be loaded')
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

const filterBase = (schema) =>
  schema
    .split('\n')
    .filter((line) => !baseLines.includes(line))
    .join('\n')

const main = async (inputPath = '**/[A-Z]*.(graphql|gql)') => {
  const schema = filterBase(await loadSchema(inputPath))
  debug(`The resulting merged schema:\n${schema.replace(/^/gm, '\t')}`)
  // debug(`Pushing the schema to ${FAUGRA_DOMAIN}/import in OVERRIDE mode!`)
  debug(`Pushing the schema to ${FAUGRA_DOMAIN}/import in NORMAL mode`)

  const t0 = performance.now()
  // const response = await fetch(`${FAUGRA_DOMAIN}/import?mode=override`, {
  const response = await fetch(`${FAUGRA_DOMAIN}/import`, {
    method: 'POST',
    body: schema,
    headers: new fetch.Headers({
      Authorization: `Bearer ${FAUGRA_SECRET}`,
    }),
  })
  debug(`The call to fauna took ${performance.now() - t0} milliseconds.`)

  const message = await response.text()
  if (response.status !== 200) {
    throw new Error(message)
  }

  return message
}

if (require.main === module) {
  const [inputPath] = process.argv.slice(2)

  return main(inputPath)
    .then((message) => {
      console.log(message)
      process.exit(0)
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

module.exports = main
