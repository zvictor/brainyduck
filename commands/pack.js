#!/usr/bin/env node

import path from 'path'
import _debug from 'debug'
import { execaSync } from 'execa'
import { fileURLToPath } from 'url'
import { temporaryDirectory } from 'tempy'
import exportIt from './export.js'

const debug = _debug('brainyduck:pack')

export default async function main() {
  const destination = temporaryDirectory()
  debug(`packing at:`, { destination }, process.cwd())

  await exportIt(destination)

  execaSync(`npm`, ['pack', '--pack-destination', process.cwd()], {
    cwd: destination,
    stdio: ['ignore', 'ignore', process.stderr],
  })

  return path.join(process.cwd(), `brainyduck-sdk-1.0.0.tgz`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [destination] = process.argv.slice(2)

  ;(async () => {
    const location = await main(destination)

    console.log(`The package has been compressed and saved at ${location}`)
    process.exit(0)
  })()
}
