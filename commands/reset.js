#!/usr/bin/env node

import fs from 'fs'
import ora from 'ora'
import path from 'path'
import chalk from 'chalk'
import readline from 'node:readline'
import { fileURLToPath } from 'url'
import { runFQL, importSchema } from '../utils.js'

const ALL_TYPES = {
  functions: true,
  indexes: true,
  roles: true,
  documents: true,
  collections: true,
  databases: true,
  schemas: true,
}

const readScript = (name) =>
  fs.readFileSync(new URL(path.join(`../scripts/`, name), import.meta.url), { encoding: 'utf8' })

const confirm = (types = ALL_TYPES) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const listOfTypes = chalk.red.bold(Object.keys(types).join(', '))

    console.warn(
      `\n\nYou are about to wipe out all the ${listOfTypes} from the database associated to the key you provided.`
    )
    console.warn(`This action is irreversible and might possibly affect production data.\n\n`)

    rl.question(
      chalk.bold(`Are you sure you want to delete all the ${listOfTypes}? (y/N)`),
      (answer) => {
        rl.close()
        resolve(answer === 'y')
      }
    )
  })

const reset = (type) => {
  const spinner = ora(`Wiping out ${type}...`).start()

  try {
    const { data } = runFQL(readScript(`reset.${type}.fql`))

    if (!data || !data.length) {
      return spinner.succeed(`No data was deleted of type '${type}'`)
    }

    spinner.succeed(`${type} cleared out`)

    for (const item of data) {
      console.log(`\tdeleted:`, item.data ? item.data.map((i) => i.ref['@ref']) : item['@ref'])
    }

    return data
  } catch (e) {
    spinner.fail(`${type} reset failed`)
    throw e
  }
}

export default async function main(types = ALL_TYPES) {
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
    const types =
      process.argv[2] && Object.fromEntries(process.argv[2].split(',').map((type) => [type, true]))

    if (await confirm(types)) {
      await main(types)
      console.log(`All reset operations have succeeded.`)
    }
  })()
}
