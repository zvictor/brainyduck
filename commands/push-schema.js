#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const debug = require('debug')('faugra:push-schema')
const figures = require('figures')
const { loadTypedefs, OPERATION_KINDS } = require('@graphql-tools/load')
const { print } = require('graphql')
const { mergeTypeDefs } = require('@graphql-tools/merge')
const { patternMatch, importSchema, baseSchema, FaugraSchemaLoader } = require('../utils')

// The version below is simpler but cuts out the directive statements from the output 😕
// const { loadSchemaSync } = require('@graphql-tools/load')
// const { printSchema } = require('graphql')

// const loadSchema = async (pattern) => {
//   debug(`Looking for schemas matching '${pattern}'`)

//   const files = (
//     await patternMatch(Array.isArray(pattern) ? pattern : pattern.split(','))
//   ).map((x) => path.resolve(x))
//   files.map((x) => debug(`\t${figures.pointer} found ${x}`))

//   const schema = loadSchemaSync(files, {
//     loaders: [new FaugraSchemaLoader()],
//   })

//   return printSchema(schema)
// }

const loadSchema = async (pattern) => {
  debug(`Looking for schemas matching '${pattern}'`)

  const files = (
    await patternMatch(Array.isArray(pattern) ? pattern : pattern.split(','))
  ).map((x) => path.resolve(x))

  if (!files.length) {
    throw new Error(`no file could be found with pattern '${pattern}'`)
  }

  files.map((x) => debug(`\t${figures.pointer} found ${x}`))

  const typeDefs = await loadTypedefs(files, {
    loaders: [new FaugraSchemaLoader()],
    filterKinds: OPERATION_KINDS,
    sort: false,
    forceGraphQLImport: true,
  })

  if (!typeDefs.length) {
    throw new Error('no documents could be loaded')
  }

  const mergedDocuments = print(
    mergeTypeDefs(
      typeDefs.map((r) => r.document),
      {
        useSchemaDefinition: false,
      }
    )
  )

  return typeof mergedDocuments === 'string'
    ? mergedDocuments
    : mergedDocuments && print(mergedDocuments)
}

const filterBase = (schema) =>
  schema
    .split('\n')
    .filter((line) => !baseSchema.split('\n').includes(line))
    .join('\n')

const main = async (inputPath = '**/[A-Z]*.(graphql|gql)', override) => {
  debug(`called with:`, { inputPath, override })
  const schema = filterBase(await loadSchema(inputPath))

  const prettySchema = schema.replace(/^/gm, '\t')
  debug(`The resulting merged schema:\n${prettySchema}`)

  try {
    return importSchema(schema, override)
  } catch (error) {
    console.error(`The schema below could not be pushed to fauna:\n\n${prettySchema}`)

    throw error
  }
}

if (require.main === module) {
  const [inputPath] = process.argv.slice(2)

  let startup = Promise.resolve()

  if (process.env.FAUGRA_OVERWRITE) {
    startup = require('./reset')({ collections: true, schemas: true })
  }

  startup.then(() =>
    main(inputPath)
      .then((message) => {
        console.log(message)
        process.exit(0)
      })
      .catch((e) => {
        console.error(e)
        process.exit(1)
      })
  )
}

module.exports = main
