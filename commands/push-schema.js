#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const debug = require('debug')('faugra:push-schema')
const figures = require('figures')
const { patternMatch, importSchema } = require('../utils')

const extendTypes = (schema) => {
  const regexp = /[\s]+extend[\s]+type[\s]+([^\s]+)[\s]*\{([^\}]*)}/gm

  for (const [raw, name, content] of schema.matchAll(regexp)) {
    schema = schema
      .replace(raw, '')
      .replace(new RegExp(`(?<!extend )type[\\s]+${name}[\\s]*\\{`), `type ${name} {${content}\n`)

    if (!schema.match(new RegExp(`type[\\s]+${name}[\\s]*\\{`))) {
      console.error(`Make sure a type has been defined before trying to extend it 🍳`)
      throw new Error(`Type ${name} could not be extended`)
    }
  }

  return schema
}

const loadSchema = async (pattern) => {
  debug(`Looking for schemas matching '${pattern}'`)

  const files = (
    await patternMatch(Array.isArray(pattern) ? pattern : pattern.split(','))
  ).map((x) => path.resolve(x))

  if (!files.length) {
    throw new Error(`no file could be found with pattern '${pattern}'`)
  }

  const content = files.map((x) => {
    debug(`\t${figures.pointer} found ${x}`)
    return fs.readFileSync(x)
  })

  return content.join('\n')
}

const main = async (inputPath = '**/[A-Z]*.(graphql|gql)', override) => {
  debug(`called with:`, { inputPath, override })
  const schema = extendTypes(await loadSchema(inputPath))

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
