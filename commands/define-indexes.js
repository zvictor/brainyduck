#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import _debug from 'debug'
import figures from 'figures'
import faunadb from 'faunadb'
import logSymbols from 'log-symbols'
import { fileURLToPath } from 'url'
import { faunaClient, patternMatch, runFQL } from '../utils.js'

const { query: q } = faunadb
const debug = _debug('faugra:define-indexes')

export default async function main(pattern = '**/*.index') {
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

      query = replacing ? `Update(Index('${name}'), ${query})` : `CreateIndex(${query})`

      const data = await runFQL(query)
      debug(`${logSymbols.success} index has been created/updated: ${data.name}`)

      return data
    })
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [pattern] = process.argv.slice(2)

  ;(async () => {
    if (process.env.FAUGRA_OVERWRITE) {
      const { default: reset } = await import('./reset.js')
      await reset({ indexes: true })
    }

    const refs = await main(pattern)

    console.log(
      `User-defined index(es) created or updated:`,
      refs.map((x) => x.name)
    )
  })()
}
