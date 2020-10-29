#!/usr/bin/env node

const path = require('path')
const { program } = require('commander')
const package = require('./package.json')

program
  .version(package.version)

  .option(
    '-s, --secret <value>',
    `set Fauna's secret key, used to push/pull schemas to and from the database (defaults to <FAUGRA_SECRET>).`
  )
  .on('option:secret', function () {
    process.env.FAUGRA_SECRET = this.secret
  })

  .option(
    '-d, --domain <value>',
    `set Fauna's endpoint (defaults to <FAUGRA_DOMAIN or 'https://graphql.fauna.com'>).`
  )
  .on('option:domain', function () {
    process.env.FAUGRA_DOMAIN = this.domain
  })

  .option(
    '-i, --ignore <value>',
    `set glob patterns to exclude matches (defaults to <FAUGRA_IGNORE or '**/node_modules/**,**/.git/**'>).`
  )
  .on('option:ignore', function () {
    process.env.FAUGRA_IGNORE = this.ignore
  })

  .option('--no-watch', `disable the files watcher (only used in the dev command).`)
  .on('option:no-watch', function () {
    process.env.FAUGRA_NO_WATCH = !this.watch
  })

  .option(
    '--callback <command>',
    `run external command after every execution completion (only used in the dev command).`
  )
  .on('option:callback', function () {
    process.env.CALLBACK = this.callback
  })

  .option('--verbose', `run the command with verbose logging.`)
  .on('option:verbose', function () {
    process.env.DEBUG = 'faugra:*'
  })

  .option('--debug [port]', `run the command with debugging listening on [port].`)
  .on('option:debug', function () {
    process.env.NODE_OPTIONS = `--inspect=${this.debug || 9229}`
  })

  .option('--debug-brk [port]', `run the command with debugging(-brk) listening on [port].`)
  .on('option:debug-brk', function () {
    process.env.NODE_OPTIONS = `--inspect-brk=${this['debug-brk'] || 9229}`
  })

  .command(
    'dev [directory]',
    'watch for changes and run helpers accordingly. Defaults: [directory: <pwd>]',
    {
      executableFile: path.join(__dirname, './commands/dev.js'),
      isDefault: true,
    }
  )

  .command(
    'define-functions [pattern]',
    'upload your User-Defined Functions (UDF) to faunadb. Defaults: [pattern: **/*.udf]',
    {
      executableFile: path.join(__dirname, './commands/define-functions.js'),
    }
  )

  .command(
    'define-indexes [pattern]',
    'upload your User-Defined Indexes to faunadb. Defaults: [pattern: **/*.index]',
    {
      executableFile: path.join(__dirname, './commands/define-indexes.js'),
    }
  )

  .command(
    'define-roles [pattern]',
    'upload your User-Defined Roles (UDR) to faunadb. Defaults: [pattern: **/*.role]',
    {
      executableFile: path.join(__dirname, './commands/define-roles.js'),
    }
  )

  .command(
    'pull-schema [output]',
    'load the schema hosted in faunadb. Defaults: [output: <stdout>]',
    {
      executableFile: path.join(__dirname, './commands/pull-schema.js'),
    }
  )

  .command(
    'push-schema [pattern]',
    'push your schema to faunadb. Defaults: [pattern: **/*.(graphql|gql)]',
    {
      executableFile: path.join(__dirname, './commands/push-schema.js'),
    }
  )

  .command(
    'generate-types [pattern] [output]',
    'code generator that converts graphql schemas into typescript types. Defaults: [pattern: **/[A-Z]*.(graphql|gql), output: <stdout>]',
    {
      executableFile: path.join(__dirname, './commands/generate-types.js'),
    }
  )

  .command(
    'build-sdk [schema-pattern] [documents-pattern] [output]',
    'code generator that creates an easily accessible API. Defaults: [schema-pattern: **/[A-Z]*.(graphql|gql), documents-pattern: **/[a-z]*.(graphql|gql) output: <stdout>]',
    {
      executableFile: path.join(__dirname, './commands/build-sdk.js'),
    }
  )

  .command('reset', 'wipe out all data in the database [Be careful!]', {
    executableFile: path.join(__dirname, './commands/reset.js'),
  })

program.parse(process.argv)
