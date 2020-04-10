#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const debug = require('debug')('define-functions')
const { Client, query: q } = require('faunadb')
const logSymbols = require('log-symbols')
const { patternMatch } = require('../utils')

const secret = process.env.FAUGRA_SECRET
if (!secret) {
  throw new Error(`missing fauna's secret`)
}

const client = new Client({ secret })

const main = async (pattern = '**/*.fql') => {
  const files = await patternMatch(pattern)

  for (const file of files) {
    const name = path.basename(file, path.extname(file))
    const body = fs.readFileSync(file).toString('utf8')
    const replacing = await client.query(q.IsFunction(q.Function(name)))

    debug(`${replacing ? 'Replacing' : 'Creating'} function '${name}' from file ${file}:`)

    if (replacing) {
      await client
        .query(q.Delete(q.Function(name)))
        .then(() => debug(logSymbols.warning, 'old function deleted'))
    }

    const ref = await client.query(
      q.CreateFunction({
        name,
        body: eval(body),
      })
    )

    debug(logSymbols.success, 'new function created:', ref, '\n')
    return ref
  }
}

if (require.main === module) {
  const [pattern] = process.argv.slice(2)

  main(pattern)
    .then(() => {
      process.exit(0)
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

module.exports = main
