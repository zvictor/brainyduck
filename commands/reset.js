#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const debug = require('debug')('faugra:reset')
const { runFQL, importSchema } = require('../utils')

const readScript = (name) =>
  fs.readFileSync(path.join(__dirname, `../scripts/`, name), { encoding: 'utf8' })

const reset = async (type) => {
  debug(`Wiping out ${type}...`)

  const { data } = await runFQL(readScript(`reset.${type}.fql`))

  if (!data || !data.length) {
    return debug(`No data was deleted of type '${type}'`)
  }

  for (const item of data) {
    console.log(`deleted:`, item['@ref'])
  }

  debug(`${type} cleared out`)
}

const main = async (
  types = {
    functions: true,
    indexes: true,
    roles: true,
    collections: true,
    schemas: true,
  }
) => {
  const _types = Object.keys(types).filter((key) => types[key])
  console.log(`The following types are about to be deleted:`, _types.join(', '))

  if (types.schemas) {
    // TODO: find a way to reset the graphql schema without creating a new schema.
    await importSchema(`type Faugra { reseting: Boolean }`, true)
    console.log(`Graphql schema has been reset.`)
  }

  for (const type of _types) {
    await reset(type)
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log(`Database cleared out`)
      process.exit(0)
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

module.exports = main
