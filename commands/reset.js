#!/usr/bin/env node

import fs from 'fs'
import ora from 'ora'
import path from 'path'
import { fileURLToPath } from 'url'
import { runFQL, importSchema } from '../utils.js'

const readScript = (name) =>
  fs.readFileSync(new URL(path.join(`../scripts/`, name), import.meta.url), { encoding: 'utf8' })

const reset = (type) => {
  const spinner = ora(`Wiping out ${type}...`).start()

  try {
    const { data } = runFQL(readScript(`reset.${type}.fql`))

    if (!data || !data.length) {
      return spinner.succeed(`No data was deleted of type '${type}'`)
    }

    spinner.succeed(`${type} cleared out`)

    for (const item of data) {
      console.log(`\tdeleted:`, item['@ref'])
    }

    return data
  } catch (e) {
    spinner.fail(`${type} reset failed`)
    throw e
  }
}

export default async function main(
  types = {
    functions: true,
    indexes: true,
    roles: true,
    collections: true,
    schemas: true,
  }
) {
  const _types = Object.keys(types).filter((key) => types[key])
  console.log(`The following types are about to be deleted:`, _types)

  if (types.schemas) {
    const spinner = ora(`Wiping out the graphql schema...`).start()

    try {
      await importSchema(`enum Faugra { RESETTING }`)
      spinner.succeed(`Graphql schema has been reset.`)
    } catch (e) {
      spinner.fail()
      throw e
    }
  }

  for (const type of _types) {
    reset(type)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ;(async () => {
    await main()

    console.log(`All reset operations have succeeded.`)
  })()
}
