#!/usr/bin/env node

const scream = (e) => {
  console.error(e.stack || e)

  if (e.message === `missing faugra's secret`) {
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
// import generateTypes from './generate-types.js'
import deployIndexes from './deploy-indexes.js'
import deployRoles from './deploy-roles.js'
import pushSchema from './push-schema.js'
import build from './build.js'
import { ignored } from '../utils.js'

const debug = _debug('faugra:watcher')

const PATTERNS = {
  ts: '**/*.(ts|tsx)',
  udf: '**/*.udf',
  schema: '**/[A-Z]*.(gql|graphql)',
  index: '**/*.index',
  udr: '**/*.role',
  documents: '**/[a-z]*.(gql|graphql)',
}

const [directory = '.'] = process.argv.slice(2)
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
    const name = lock[type] || [file]
    unblock(type)

    if (!operation) {
      return debug(`Ignoring file(s) ${file} [${type}] (no operation defined)`)
    }

    const spinner = ora(`Processing ${name.sort().join(', ')} [${type}]\n`).start()

    try {
      await operation(file)
      spinner.succeed(`Processed ${name.sort().join(', ')} [${type}]`)
    } catch (e) {
      spinner.fail()
      console.error(e)
    }
  })
}

const watch = (type, pattern, operation, cumulative) =>
  new Promise((resolve) => {
    chokidar
      .watch(pattern, {
        ignoreInitial: Boolean(process.env.FAUGRA_WATCH_CHANGES),
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
  const ts = await watch('Typescript', PATTERNS['ts'], null, true)

  // const schema = await watch('Schema', PATTERNS['schema'], (file) =>
  //   generateTypes(file, file.replace(/(.gql|.graphql)$/, '$1.d.ts'))
  // )

  const schema = await watch(
    'Schema',
    PATTERNS['schema'],
    () => pushSchema(PATTERNS['schema']),
    true
  )

  const index = await watch('Index', PATTERNS['index'], deployIndexes)

  const udr = await watch('UDR', PATTERNS['udr'], deployRoles)

  const udf = await watch('UDF', PATTERNS['udf'], deployFunctions)

  const documents = await watch(
    'Document',
    PATTERNS['documents'],
    () => build(PATTERNS['schema'], PATTERNS['documents']),
    true
  )

  debug('Initial scan complete')

  if (process.env.FAUGRA_NO_WATCH) {
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
  ;(async () => {
    if (process.env.FAUGRA_OVERWRITE) {
      const { default: reset } = await import('./reset.js')
      await reset()
    }

    await main()
  })()
}
