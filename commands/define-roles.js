#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const tempy = require('tempy')
const figures = require('figures')
const logSymbols = require('log-symbols')
const debug = require('debug')('faugra:define-roles')
const faunaEval = require('fauna-shell/src/commands/eval')
const { Client, query: q } = require('faunadb')
const { patternMatch } = require('../utils')

const secret = process.env.FAUGRA_SECRET
if (!secret) {
  throw new Error(`missing fauna's secret`)
}

const client = new Client({ secret })

const main = async (pattern = '**/*.role') => {
  debug(`Looking for files matching '${pattern}'`)
  const files = await patternMatch(pattern)

  return await Promise.all(
    files.map(async (file) => {
      debug(`\t${figures.pointer} found ${file}`)
      const name = path.basename(file, path.extname(file))
      const content = fs.readFileSync(file).toString('utf8')
      const replacing = await client.query(q.IsRole(q.Role(name)))

      debug(`${replacing ? 'Replacing' : 'Creating'} role '${name}' from file ${file}:`)

      // remove comments
      let query = content.replace(/#[^!].*$([\s]*)?/gm, '')

      // forbid simplified definitions (only available for UDFs)
      if (!query.includes('{')) {
        throw new Error(`Incorrect syntax used in role definition`)
      }

      // infer role name only if it has not been declared
      if (!query.includes('name:')) {
        query = query.replace('{', `{ name: "${name}", `)
      }

      if (name !== query.match(/name:[\s]*(['"])(.*?)\1/)[2]) {
        throw new Error(`File name does not match role name: ${name}`)
      }

      query = `CreateRole(${query})`

      if (replacing) {
        await client
          .query(q.Delete(q.Role(name)))
          .then(() => debug(logSymbols.warning, 'old role deleted'))
      }

      debug(`Executing query:\n${query}`)

      const tmpFile = tempy.file()
      await faunaEval.run([query, '--secret', secret, '--output', tmpFile])

      // temporary fix for https://github.com/fauna/fauna-shell/pull/61:
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(tmpFile)
        const chunks = []

        stream.on('error', reject)
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('end', () => {
          const data = JSON.parse(Buffer.concat(chunks).toString('utf8'))

          debug(`${logSymbols.success} role has been created/updated: ${data.name}`)

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
        `User-defined role(s) created or updated:`,
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
