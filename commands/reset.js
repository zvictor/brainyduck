#!/usr/bin/env node

const fs = require('fs')
const ora = require('ora')
const path = require('path')
const debug = require('debug')('faugra:reset')
const { runFQL, importSchema } = require('../utils')

const readScript = (name) =>
  fs.readFileSync(path.join(__dirname, `../scripts/`, name), { encoding: 'utf8' })

const reset = async (type) => {
  const spinner = ora(`Wiping out ${type}...`).start()

  try {
    const { data } = await runFQL(readScript(`reset.${type}.fql`))

    if (!data || !data.length) {
      return spinner.succeed(`No data was deleted of type '${type}'`)
    }

    spinner.succeed(`${type} cleared out`)

    for (const item of data) {
      console.log(`\tdeleted:`, item['@ref'])
    }
  } catch (e) {
    spinner.fail(`${type} reset failed`)
    throw e
  }
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
  console.log(`The following types are about to be deleted:`, _types)

  if (types.schemas) {
    const spinner = ora(`Wiping out the graphql schema...`).start()

    try {
      // TODO: find a way to reset the graphql schema without creating a new schema.
      await importSchema(`type Faugra { reseting: Boolean }`, true)
      spinner.succeed(`Graphql schema has been reset.`)
    } catch (e) {
      spinner.fail()
      throw e
    }
  }

  for (const type of _types) {
    await reset(type)
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log(`All reset operations have succeeded.`)
      process.exit(0)
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

module.exports = main
