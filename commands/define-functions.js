#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const figures = require('figures')
const logSymbols = require('log-symbols')
const debug = require('debug')('faugra:define-functions')
const { Client, query: q } = require('faunadb')
const { loadSecret, patternMatch, runFQL } = require('../utils')

const secret = loadSecret()
const client = new Client({ secret })

const main = async (pattern = '**/*.udf') => {
  debug(`Looking for files matching '${pattern}'`)
  const files = await patternMatch(pattern)

  return await Promise.all(
    files.map(async (file) => {
      debug(`\t${figures.pointer} found ${file}`)
      const name = path.basename(file, path.extname(file))
      const content = fs.readFileSync(file).toString('utf8')
      const replacing = await client.query(q.IsFunction(q.Function(name)))

      debug(`${replacing ? 'Replacing' : 'Creating'} function '${name}' from file ${file}:`)

      // Remove comments.
      // Regex based on: https://stackoverflow.com/a/17791790/599991
      // Playground: https://regex101.com/r/IlsODE/3
      let query = content.replace(
        /(("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*'))|#[^\n]*/gm,
        (match, p1, p2, p3, offset, string) => p1 || ''
      )

      // converts simplified definitions into extended definitions
      if (!query.match(/^[\s]*\{/)) {
        query = `{ name: "${name}", body:\n${query}\n}`
      }

      // infer function name only if it has not been declared
      if (!query.includes('name:')) {
        query = query.replace('{', `{ name: "${name}", `)
      }

      if (name !== query.match(/name:[\s]*(['"])(.*?)\1/)[2]) {
        throw new Error(`File name does not match function name: ${name}`)
      }

      query = !replacing ? `CreateFunction(${query})` : `Update(Function('${name}'), ${query})`

      const data = await runFQL(query)
      debug(`${logSymbols.success} function has been created/updated: ${data.name}`)

      return data
    })
  )
}

if (require.main === module) {
  const [pattern] = process.argv.slice(2)

  let startup = Promise.resolve()

  if (process.env.FAUGRA_OVERWRITE) {
    startup = require('./reset')({ functions: true })
  }

  startup.then(() =>
    main(pattern)
      .then((refs) => {
        console.log(
          `User-defined function(s) created or updated:`,
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
