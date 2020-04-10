#!/usr/bin/env node

const path = require('path')
const debug = require('debug')('watcher')
const chokidar = require('chokidar')
const { default: PQueue } = require('p-queue')
const defineFunctions = require('./define-functions')
const generateTypes = require('./generate-types')

const [directory = '.'] = process.argv.slice(2)
const queue = new PQueue({ concurrency: 1 })

const react = (operation) => (message) => (file) => {
  debug(message(file))
  queue.add(() => operation(file))
}

const gql = react((file) => generateTypes(file, file.replace(/(.gql|.graphql)$/, '.d.ts')))
const fql = react((file) => defineFunctions(file))

const scream = (e) => {
  console.error(e.stack || e)
  process.exit(1)
}

process.on('unhandledRejection', scream)
process.on('uncaughtException', scream)

chokidar
  .watch('**/*.(gql|graphql)', {
    ignored: [/(^|[\/\\])\../, 'node_modules'],
    persistent: true,

    cwd: path.resolve(directory),
  })
  .on('error', (error) => debug(`error: ${error}`))
  .on(
    'add',
    gql((file) => `Watching ${file}`)
  )
  .on(
    'change',
    gql((file) => `${file} has been changed`)
  )

chokidar
  .watch('**/*.fql', {
    ignored: [/(^|[\/\\])\../, 'node_modules'],
    persistent: true,

    cwd: path.resolve(directory),
  })
  .on('error', (error) => debug(`error: ${error}`))
  .on(
    'add',
    fql((file) => `Watching ${file}`)
  )
  .on(
    'change',
    fql((file) => `${file} has been changed`)
  )
