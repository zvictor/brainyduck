#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import _debug from 'debug'
import faunadb from 'faunadb'
import figures from 'figures'
import logSymbols from 'log-symbols'
import { fileURLToPath } from 'url'
import { faunaClient, patternMatch, runFQL } from '../utils.js'

const { query: q } = faunadb
const debug = _debug('faugra:define-functions')

export default async function main(pattern = '**/*.udf') {
  debug(`Looking for files matching '${pattern}'`)
  const files = await patternMatch(pattern)

  return await Promise.all(
    files.map(async (file) => {
      debug(`\t${figures.pointer} found ${file}`)
      const name = path.basename(file, path.extname(file))
      const content = fs.readFileSync(file).toString('utf8')
      const replacing = await faunaClient().query(q.IsFunction(q.Function(name)))

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
      // Playground: https://regex101.com/r/9ndMaH/1
      if (!query.match(/^[\s]*name[\s]*:/m)) {
        query = query.replace('{', `{ name: "${name}", `)
      }

      if (name !== query.match(/name:[\s]*(['"])(.*?)\1/)[2]) {
        throw new Error(`File name does not match function name: ${name}`)
      }

      query = replacing ? `Update(Function('${name}'), ${query})` : `CreateFunction(${query})`

      const data = await runFQL(query)
      debug(`${logSymbols.success} function has been created/updated: ${data.name}`)

      return data
    })
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [pattern] = process.argv.slice(2)

  ;(async () => {
    if (process.env.FAUGRA_OVERWRITE) {
      const { default: reset } = await import('./reset.js')
      await reset({ functions: true })
    }

    const refs = await main(pattern)

    console.log(
      `User-defined function(s) created or updated:`,
      refs.map((x) => x.name)
    )
  })()
}
