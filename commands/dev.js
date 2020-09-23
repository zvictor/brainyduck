#!/usr/bin/env node

const scream = (e) => {
  console.error(e.stack || e)
  // process.exit(1)
}

process.on('unhandledRejection', scream)
process.on('uncaughtException', scream)

const ora = require('ora')
const path = require('path')
const debug = require('debug')('faugra:watcher')
const chokidar = require('chokidar')
const { default: PQueue } = require('p-queue')
const defineFunctions = require('./define-functions')
const generateTypes = require('./generate-types')
const defineRoles = require('./define-roles')
const buildSdk = require('./build-sdk')
const { ignored } = require('../utils')

const [directory = '.'] = process.argv.slice(2)
const queue = new PQueue({ autoStart: false, concurrency: 1 })

const processor = (type, operation, file) =>
  queue.add(async () => {
    const spinner = ora(`Processing ${file} [${type}]\n`).start()

    try {
      await operation(file)
      spinner.succeed(`Processed ${file} [${type}]`)
    } catch (e) {
      spinner.fail()
      console.error(e)
    }
  })

const watch = (type, pattern, operation) =>
  new Promise((resolve) => {
    chokidar
      .watch(pattern, {
        ignored: [/(^|[\/\\])\../, ...ignored],
        persistent: true,
        cwd: path.resolve(directory),
      })
      .on('error', (error) => debug(`error: ${error}`))
      .on('add', (file) => {
        debug(`Watching ${file} [${type}]`)
        processor(type, operation, file)
      })
      .on('change', (file) => {
        debug(`${file} has been changed [${type}]`)
        processor(type, operation, file)
      })
      .on('ready', resolve)
  })

const main = async () => {
  const schema = watch('Schema', '**/[A-Z]*.(gql|graphql)', (file) =>
    generateTypes(file, file.replace(/(.gql|.graphql)$/, '$1.d.ts'))
  )

  const documents = watch('Document', '**/[a-z]*.(gql|graphql)', async (file) =>
    buildSdk(undefined, undefined, './faugra.sdk.ts')
  )

  const udf = watch('UDF', '**/*.udf', defineFunctions)
  const udr = watch('UDR', '**/*.role', defineRoles)

  await Promise.all([schema, documents, udf])
  await Promise.all([udr])

  debug('Initial scan complete')
  queue.start()
}

main()
