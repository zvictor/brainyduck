#!/usr/bin/env node

import ora from 'ora'
import { fileURLToPath } from 'node:url'
import deployFunctions from './deploy-functions.js'
import deployIndexes from './deploy-indexes.js'
import deployRoles from './deploy-roles.js'
import deploySchemas from './deploy-schemas.js'
import { representData } from '../utils.js'

const ALL_TYPES = {
  schemas: deploySchemas,
  indexes: deployIndexes,
  roles: deployRoles,
  functions: deployFunctions,
}

const deploy = async (type) => {
  const spinner = ora(`Deploying ${type}...`).start()

  try {
    const operation = ALL_TYPES[type]
    let data

    try {
      data = await operation()
    } catch (error) {
      if (error.message !== `No matching file could be found`) {
        throw error
      }

      return spinner.info(`No ${type} to deploy`)
    }

    if (!data || !data.length) {
      return spinner.fail(`Nothing was deployed of type '${type}'`)
    }

    spinner.succeed(`${type} have been deployed!`)
    console.log(`${type}:`, type === 'schemas' ? data : representData(data), '\n')

    return data
  } catch (e) {
    spinner.fail(`${type} deployment has failed`)
    throw e
  }
}

export default async function main(types = ALL_TYPES) {
  const _types = Object.keys(types).filter((key) => types[key])
  console.log(`The following types are about to be deployed:`, _types)

  for (const type of Object.keys(ALL_TYPES)) {
    if (!_types.includes(type)) {
      debug(`Skipping ${type}`)
      continue
    }

    await deploy(type)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ;(async () => {
    const types =
      process.argv[2] && Object.fromEntries(process.argv[2].split(',').map((type) => [type, true]))

    if (process.env.BRAINYDUCK_OVERWRITE) {
      const { default: reset } = await import('./reset.js')
      await reset(types)
    }

    await main(types)

    console.log(`\n\nAll done! All deployments have been successful 🦆`)
    process.exit(0)
  })()
}
