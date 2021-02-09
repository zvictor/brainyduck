#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const figures = require('figures')
const logSymbols = require('log-symbols')
const debug = require('debug')('faugra:define-indexes')
const { query: q } = require('faunadb')
const { faunaClient, patternMatch, runFQL } = require('../utils')

const main = async (pattern = '**/*.index') => {
  debug(`Looking for files matching '${pattern}'`)
  const files = await patternMatch(pattern)

  return await Promise.all(
    files.map(async (file) => {
      debug(`\t${figures.pointer} found ${file}`)
      const name = path.basename(file, path.extname(file))
      const content = fs.readFileSync(file).toString('utf8')
      const replacing = await faunaClient().query(q.IsIndex(q.Index(name)))

      debug(`${replacing ? 'Replacing' : 'Creating'} index '${name}' from file ${file}:`)

      // remove comments
      let query = content.replace(/#[^!].*$([\s]*)?/gm, '')

      // forbid simplified definitions (only available for UDFs)
      if (!query.match(/^[\s]*\{/)) {
        throw new Error(`Incorrect syntax used in index definition`)
      }

      // infer index name only if it has not been declared
      if (!query.includes('name:')) {
        query = query.replace('{', `{ name: "${name}", `)
      }

      if (name !== query.match(/name:[\s]*(['"])(.*?)\1/)[2]) {
        throw new Error(`File name does not match index name: ${name}`)
      }

      query = !replacing ? `CreateIndex(${query})` : `Update(Index('${name}'), ${query})`

      const data = await runFQL(query)
      debug(`${logSymbols.success} index has been created/updated: ${data.name}`)

      return data
    })
  )
}

if (require.main === module) {
  const [pattern] = process.argv.slice(2)

  let startup = Promise.resolve()

  if (process.env.FAUGRA_OVERWRITE) {
    startup = require('./reset')({ indexes: true })
  }

  startup.then(() =>
    main(pattern)
      .then((refs) => {
        console.log(
          `User-defined index(es) created or updated:`,
          refs.map((x) => x.name)
        )
        process.exit(0)
      })
      .catch((e) => {
        console.error(e)
        process.exit(1)
      })
  )
}

module.exports = main
