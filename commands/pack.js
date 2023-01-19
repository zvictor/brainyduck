#!/usr/bin/env node

import fs from 'fs-extra'
import path from 'path'
import _debug from 'debug'
import { execaSync } from 'execa'
import { fileURLToPath } from 'url'
import { locateCache } from '../utils.js'

const debug = _debug('brainyduck:pack')

export default async function main(destination) {
  debug(`called with:`, { destination })

  if (!destination) {
    throw new Error(`Please provide a destination for your package`)
  }

  if (!fs.existsSync(locateCache(`sdk.mjs`))) {
    throw new Error(`Please run the 'build' command before running 'pack'`)
  }

  if (fs.existsSync(destination) && fs.readdirSync(destination).length > 0) {
    throw new Error(`Destination '${destination}' already exists and is not empty`)
  }

  fs.copySync(locateCache(`.`), destination, {
    // filter: (src) => console.log(src) || !src.includes('/.'),
  })

  fs.writeFileSync(
    path.join(destination, 'package.json'),
    `{
    "name": "brainyduck-sdk",
    "type": "module",
    "exports": {
      ".": {
        "types": "./sdk.d.ts",
        "import": "./sdk.mjs",
        "require": "./sdk.cjs"
      }
    },
    "main": "./sdk.cjs",
    "types": "./sdk.d.ts",
    "dependencies": {
      "graphql-request": "latest",
      "graphql-tag": "latest"
    }
  }`
  )
  debug(`The sdk has been packed at ${destination}`)

  execaSync(`npm`, ['i'], {
    cwd: destination,
  })

  return destination
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [destination] = process.argv.slice(2)

  ;(async () => {
    const location = await main(destination)

    console.log(`The package has been saved at ${location}`)
    process.exit(0)
  })()
}
