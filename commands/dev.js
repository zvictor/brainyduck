#!/usr/bin/env node

const scream = (e) => {
  console.error(e.stack || e)
  process.exit(1)
}

process.on('unhandledRejection', scream)
process.on('uncaughtException', scream)

const path = require('path')
const debug = require('debug')('watcher')
const chokidar = require('chokidar')
const { default: PQueue } = require('p-queue')
const defineFunctions = require('./define-functions')
const generateTypes = require('./generate-types')

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
        queue.add(() => operation(file))
      })
      .on('change', (file) => {
        debug(`${file} has been changed`)
        queue.add(() => operation(file))
      })
      .on('ready', resolve)
  })

const gql = watch('Schema', '**/*.(gql|graphql)', (file) =>
  generateTypes(file, file.replace(/(.gql|.graphql)$/, '.d.ts'))
)
const fql = watch('UDF', '**/*.fql', defineFunctions)

Promise.all([gql, fql]).then(() => {
  debug('Initial scan complete')
  queue.start()
})
