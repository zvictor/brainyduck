#!/usr/bin/env node

const scream = (e) => {
  console.error(e.stack || e)
  // process.exit(1)
}

process.on('unhandledRejection', scream)
process.on('uncaughtException', scream)

const path = require('path')
const debug = require('debug')('watcher')
const chokidar = require('chokidar')
const { default: PQueue } = require('p-queue')
const defineFunctions = require('./define-functions')
const generateTypes = require('./generate-types')
const buildSdk = require('./build-sdk')

const [directory = '.'] = process.argv.slice(2)
const queue = new PQueue({ autoStart: false, concurrency: 1 })

const watch = (name, pattern, operation) =>
  new Promise((resolve) => {
    chokidar
      .watch(pattern, {
        ignored: [/(^|[\/\\])\../, 'node_modules'],
        persistent: true,

        cwd: path.resolve(directory),
      })
      .on('error', (error) => debug(`error: ${error}`))
      .on('add', (file) => {
        debug(`Watching ${file} [${name}]`)
        queue.add(async () => {
          console.log(`${name} ${file} has been added.`)
          await operation(file)
          console.log(`${file} has been processed.`)
        })
      })
      .on('change', (file) => {
        debug(`${file} has been changed`)
        queue.add(async () => {
          console.log(`${name} ${file} has been modified.`)
          await operation(file)
          console.log(`${file} has been processed.`)
        })
      })
      .on('ready', resolve)
  })

const schema = watch('Schema', '**/[A-Z]*.(gql|graphql)', (file) =>
  generateTypes(file, file.replace(/(.gql|.graphql)$/, '$1.d.ts'))
)

const documents = watch('Document', '**/[a-z]*.(gql|graphql)', async (file) =>
  buildSdk(undefined, undefined, './faugra.sdk.ts')
)

const fql = watch('UDF', '**/*.fql', defineFunctions)

Promise.all([schema, documents, fql]).then(() => {
  debug('Initial scan complete')
  queue.start()
})
