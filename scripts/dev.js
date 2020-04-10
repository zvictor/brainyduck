#!/usr/bin/env node

const path = require('path')
const debug = require('debug')('watcher')
const chokidar = require('chokidar')
const { default: PQueue } = require('p-queue')
const defineFunctions = require('./define-functions')
const generateTypes = require('./generate-types')

const [directory = '.'] = process.argv.slice(2)
const queue = new PQueue({ concurrency: 1 })

const react = (operation) => (file) => {
  debug(`File ${file} has been changed`)
  queue.add(() => operation(file))
}

chokidar
  .watch('**/*.(gql|graphql)', {
    ignored: [/(^|[\/\\])\../, 'node_modules'],
    persistent: true,

    cwd: path.resolve(directory),
  })
  .on('error', (error) => debug(`error: ${error}`))
  .on('add', (file) => debug(`Watching ${file}`)) // TODO: act here as well?
  .on(
    'change',
    react((file) => generateTypes(file, file.replace(/(.gql|.graphql)$/, '.d.ts')))
  )

chokidar
  .watch('**/*.fql', {
    ignored: [/(^|[\/\\])\../, 'node_modules'],
    persistent: true,

    cwd: path.resolve(directory),
  })
  .on('error', (error) => debug(`error: ${error}`))
  .on('add', (file) => debug(`Watching ${file}`)) // TODO: act here as well?
  .on('change', react(defineFunctions))
