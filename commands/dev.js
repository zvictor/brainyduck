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
const queue = new PQueue({ concurrency: 1 })

const watch = (name, pattern, operation) =>
    chokidar
      .watch(pattern, {
        ignored: [/(^|[\/\\])\../, 'node_modules'],
        persistent: true,

        cwd: path.resolve(directory),
      })
      .on('error', (error) => debug(`error: ${error}`))
      .on('add', (file) => {
        debug(`Found ${file} [${name}]. Watching for changes...`)
        queue.add(() => operation(file))
      })
      .on('change', (file) => {
        debug(`${file} has been changed`)
        queue.add(() => operation(file))
      })

const gql = watch('Schema', '**/*.(gql|graphql)', (file) =>
  generateTypes(file, file.replace(/(.gql|.graphql)$/, '.d.ts'))
)
const fql = watch('UDF', '**/*.fql', defineFunctions)
