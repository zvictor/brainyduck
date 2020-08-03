#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const tempy = require('tempy')
const figures = require('figures')
const logSymbols = require('log-symbols')
const debug = require('debug')('define-functions')
const faunaEval = require('fauna-shell/src/commands/eval')
const { Client, query: q } = require('faunadb')
const { patternMatch } = require('../utils')

const secret = process.env.FAUGRA_SECRET
if (!secret) {
  throw new Error(`missing fauna's secret`)
}

const client = new Client({ secret })

const main = async (pattern = '**/*.fql') => {
  debug(`Looking for files matching '${pattern}'`)
  const files = await patternMatch(pattern)

  return await Promise.all(
    files.map(async (file) => {
      debug(`\t${figures.pointer} found ${file}`)
      const name = path.basename(file, path.extname(file))
      const body = fs.readFileSync(file).toString('utf8')
      const replacing = await client.query(q.IsFunction(q.Function(name)))

      debug(`${replacing ? 'Replacing' : 'Creating'} function '${name}' from file ${file}:`)

      if (replacing) {
        await client
          .query(q.Delete(q.Function(name)))
          .then(() => debug(logSymbols.warning, 'old function deleted'))
      }

      const query = `CreateFunction({ name: "${name}", body:\n${body}\n})`
      debug(`Executing query:\n${query}`)

      const tmpFile = tempy.file()
      await faunaEval.run([query, '--secret', secret, '--output', tmpFile])

      return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(tmpFile)
        const chunks = []

        stream.on('error', reject)
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('end', () => {
          const data = JSON.parse(Buffer.concat(chunks).toString('utf8'))

          debug(`${logSymbols.success} function has been created/updated: ${data.name}`)

          resolve(data)
        })
      })
    })
  )
}

if (require.main === module) {
  const [pattern] = process.argv.slice(2)

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
}

module.exports = main
