#!/usr/bin/env node

const scream = (e) => {
  console.error(e.stack || e)

  if (e.message === `missing faugra's secret`) {
    process.exit(1)
  }
}

process.on('unhandledRejection', scream)
process.on('uncaughtException', scream)

const ora = require('ora')
const path = require('path')
const execa = require('execa')
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

const runCallback = () => {
  if (!process.env.CALLBACK) return

  console.log(`Running callback '${process.env.CALLBACK}':`)
  const cmd = process.env.CALLBACK.split(' ')

  execa.sync(cmd.shift(), cmd, {
    stdio: ['pipe', process.stdout, process.stderr],
    cwd: process.cwd(),
  })

  console.log('')
}

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
  const udf = await watch('UDF', '**/*.udf', defineFunctions)
  const udr = await watch('UDR', '**/*.role', defineRoles)

  const schema = await watch('Schema', '**/[A-Z]*.(gql|graphql)', (file) =>
    generateTypes(file, file.replace(/(.gql|.graphql)$/, '$1.d.ts'))
  )

  const documents = await watch('Document', '**/[a-z]*.(gql|graphql)', async (file) =>
    buildSdk(undefined, undefined, './faugra.sdk.ts')
  )

  debug('Initial scan complete')

  if (process.env.FAUGRA_NO_WATCH) {
    queue.onIdle().then(() => {
      runCallback()

      console.log('All operations complete')
      process.exit(0)
    })
  } else {
    const spinner = ora({
      text: `All done! Waiting for new files changes`,
      prefixText: '\n',
      spinner: 'bounce',
    })

    queue.on('active', () => {
      spinner.stop()
    })

    queue.on('idle', () => {
      runCallback()
      spinner.start()
    })
  }

  queue.start()
}

main()
