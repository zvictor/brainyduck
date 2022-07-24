#!/usr/bin/env node

const scream = (e) => {
  console.error(e.stack || e)

  if (e.message === `missing brainyduck's secret`) {
    process.exit(1)
  }
}

process.on('unhandledRejection', scream)
process.on('uncaughtException', scream)

import ora from 'ora'
import path from 'path'
import _debug from 'debug'
import PQueue from 'p-queue'
import chokidar from 'chokidar'
import { execaSync } from 'execa'
import { fileURLToPath } from 'url'
import deployFunctions from './deploy-functions.js'
import deployIndexes from './deploy-indexes.js'
import deployRoles from './deploy-roles.js'
import deploySchemas from './deploy-schemas.js'
import build from './build.js'
import { patterns, ignored } from '../utils.js'

const debug = _debug('brainyduck:watcher')

const queue = new PQueue({ autoStart: false, concurrency: 1 })
const lock = {}

const block = (type, file) => {
  lock[type] = lock[type] || []
  lock[type].push(file)
}

const unblock = (type) => {
  lock[type] = false
}

const runCallback = () => {
  if (!process.env.CALLBACK) return

  console.log(`Running callback '${process.env.CALLBACK}':`)
  const cmd = process.env.CALLBACK.split(' ')

  execaSync(cmd.shift(), cmd, {
    stdio: ['ignore', process.stdout, process.stderr],
    cwd: process.cwd(),
  })

  console.log('')
}

const processor = (type, operation, file, cumulative) => {
  if (lock[type]) {
    return block(type, file)
  }

  if (cumulative) {
    block(type, file)
  }

  queue.add(async () => {
    const filesList = (lock[type] || [file])
      .map((x) => path.relative(process.cwd(), x))
      .sort()
      .join(', ')

    unblock(type)

    if (!operation) {
      return debug(`Ignoring file(s) ${file} [${type}] (no operation defined)`)
    }

    const spinner = ora(`Processing ${filesList} [${type}]\n`).start()

    try {
      await operation(file)
      spinner.succeed(`Processed ${filesList} [${type}]`)
    } catch (e) {
      spinner.fail()
      console.error(e)
    }
  })
}

const watch = (type, pattern, operation, cumulative) =>
  new Promise((resolve) => {
    const directory = process.cwd()

    chokidar
      .watch(pattern, {
        ignoreInitial: Boolean(process.env.BRAINYDUCK_WATCH_CHANGES),
        ignored: [/(^|[\/\\])\../, ...ignored],
        persistent: true,
        cwd: path.resolve(directory),
      })
      .on('error', (error) => debug(`error: ${error}`))
      .on('add', (file) => {
        file = path.join(directory, file)

        debug(`Watching ${file} [${type}]`)
        operation && processor(type, operation, file, cumulative)
      })
      .on('change', (file) => {
        file = path.join(directory, file)

        debug(`${file} has been changed [${type}]`)
        processor(type, operation, file, cumulative)
      })
      .on('ready', resolve)
  })

export default async function main() {
  const ts = await watch('Typescript', patterns.TS, null, true)

  // const schema = await watch('Schema', patterns.SCHEMA, (file) =>
  //   generateTypes(file, file.replace(/(.gql|.graphql)$/, '$1.d.ts'))
  // )

  const schema = await watch(
    'Schema',
    patterns.SCHEMA,
    async () => {
      await build(patterns.SCHEMA, patterns.DOCUMENTS)
      await deploySchemas(patterns.SCHEMA, { override: true })
    },
    true
  )

  const index = await watch('Index', patterns.INDEX, deployIndexes)

  const udr = await watch('UDR', patterns.UDR, deployRoles)

  const udf = await watch('UDF', patterns.UDF, deployFunctions)

  const documents = await watch(
    'Document',
    patterns.DOCUMENTS,
    () => build(patterns.SCHEMA, patterns.DOCUMENTS),
    true
  )

  debug('Initial scan complete')

  if (process.env.BRAINYDUCK_NO_WATCH) {
    queue.onIdle().then(() => {
      runCallback()

      console.log('All operations complete')
      process.exit(0)
    })
  } else {
    let started = false

    const spinner = ora({
      text: `All done! Waiting for new file changes 🦆`,
      prefixText: '\n',
      spinner: 'bounce',
    })

    queue.on('active', () => {
      started = true
      spinner.stop()
    })

    queue.on('idle', () => {
      if (started) {
        runCallback()
      }

      spinner.start()
    })
  }

  queue.start()
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [directory] = process.argv.slice(2)

  ;(async () => {
    if (process.env.BRAINYDUCK_OVERWRITE) {
      const { default: reset } = await import('./reset.js')
      await reset()
    }

    if (directory) {
      process.chdir(directory)
      debug(`Changed directory to ${process.cwd()}`)
    }

    await main()
  })()
}
