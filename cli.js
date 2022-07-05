#!/usr/bin/env node

import fs from 'fs'
import { fileURLToPath } from 'url'
import { program } from 'commander'
import { constantCase } from 'constant-case'
import { patterns } from './utils.js'

const prefix = {
  FAUNA: 'FAUNA',
  FAUGRA: 'FAUGRA',
}

const pkg = JSON.parse(
  await fs.readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)))
)

const optionParser =
  (key, _prefix = prefix.FAUGRA) =>
  () => {
    let name = constantCase(key)
    if (_prefix) {
      name = `${_prefix}_${name}`
    }

    return (process.env[name] = program.opts()[key])
  }

program
  .version(pkg.version)

  .option(
    '-s, --secret <value>',
    `set Fauna's secret key, used to deploy data to your database (defaults to <${prefix.FAUNA}_SECRET>).`
  )
  .on('option:secret', optionParser('secret', prefix.FAUNA))

  .option(
    '--domain <value>',
    `FaunaDB server domain (defaults to <${prefix.FAUNA}_DOMAIN or 'db.fauna.com'>).`
  )
  .on('option:domain', optionParser('domain', prefix.FAUNA))

  .option('--port <value>', `Connection port (defaults to <${prefix.FAUNA}_PORT>).`)
  .on('option:port', optionParser('port', prefix.FAUNA))

  .option(
    '--graphql-domain <value>',
    `Graphql server domain (defaults to <${prefix.FAUNA}_GRAPHQL_DOMAIN or 'graphql.fauna.com'>).`
  )
  .on('option:graphql-domain', optionParser('graphqlDomain', prefix.FAUNA))

  .option(
    '--graphql-port <value>',
    `Graphql connection port (defaults to <${prefix.FAUNA}_GRAPHQL_PORT>).`
  )
  .on('option:graphql-port', optionParser('graphqlPort', prefix.FAUNA))

  .option(
    '--scheme <value>',
    `Connection scheme (defaults to <${prefix.FAUNA}_SCHEME or 'https'>).`
  )
  .on('option:scheme', optionParser('scheme', prefix.FAUNA))

  .option('--overwrite', `wipe out data related to the command before its execution`)
  .on('option:overwrite', optionParser('overwrite'))

  .option('--no-operations-generation', `disable the auto-generated operations documents.`)
  .on('option:no-operations-generation', function () {
    process.env.FAUGRA_NO_OPERATIONS_GENERATION = !this.operationsGeneration
  })

  .option(
    '-i, --ignore <value>',
    `set glob patterns to exclude matches (defaults to <FAUGRA_IGNORE or '**/node_modules/**,**/.git/**'>).`
  )
  .on('option:ignore', optionParser('ignore'))

  .option('--no-watch', `disable the files watcher (only used in the dev command).`)
  .on('option:no-watch', function () {
    process.env.FAUGRA_NO_WATCH = !this.watch
  })

  .option(
    '--watch-changes',
    `ignore initial files and watch changes ONLY (only used in the dev command).`
  )
  .on('option:watch-changes', optionParser('watchChanges'))

  .option(
    '--callback <command>',
    `run external command after every execution completion (only used in the dev command).`
  )
  .on('option:callback', optionParser('callback'))

  .option('--tsconfig', `use a custom tsconfig file for the sdk transpilation.`)
  .on('option:tsconfig', function () {
    process.env.FAUGRA_TSCONFIG = this.tsconfig
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
    'build [schemas-pattern] [documents-pattern] [output]',
    'code generator that creates an easily accessible API. Defaults: [schemas-pattern: **/[A-Z]*.(graphql|gql), documents-pattern: **/[a-z]*.(graphql|gql) output: <FAUGRA_CACHE>]',
    {
      executableFile: fileURLToPath(new URL('./commands/build.js', import.meta.url)),
    }
  )

  .command('dev [directory]', 'deploy and watch for changes. Defaults: [directory: <pwd>]', {
    executableFile: fileURLToPath(new URL('./commands/dev.js', import.meta.url)),
    isDefault: true,
  })

  .command(
    'deploy [types]',
    'deploy the local folder to your database. Defaults: [types: functions,indexes,roles,documents,collections,databases,schemas]',
    {
      executableFile: fileURLToPath(new URL('./commands/deploy.js', import.meta.url)),
    }
  )

  .command(
    'deploy-schemas [pattern]',
    'push your schema to faunadb. Defaults: [pattern: **/*.(graphql|gql)]',
    {
      executableFile: fileURLToPath(new URL('./commands/deploy-schemas.js', import.meta.url)),
    }
  )

  .command(
    'deploy-functions [pattern]',
    `upload your User-Defined Functions (UDF) to faunadb. Defaults: [pattern: ${patterns.UDF}]`,
    {
      executableFile: fileURLToPath(new URL('./commands/deploy-functions.js', import.meta.url)),
    }
  )

  .command(
    'deploy-indexes [pattern]',
    `upload your User-Defined Indexes to faunadb. Defaults: [pattern: ${patterns.INDEX}]`,
    {
      executableFile: fileURLToPath(new URL('./commands/deploy-indexes.js', import.meta.url)),
    }
  )

  .command(
    'deploy-roles [pattern]',
    `upload your User-Defined Roles (UDR) to faunadb. Defaults: [pattern: ${patterns.UDR}]`,
    {
      executableFile: fileURLToPath(new URL('./commands/deploy-roles.js', import.meta.url)),
    }
  )

  .command(
    'pull-schema [output]',
    'load the schema hosted in faunadb. Defaults: [output: <stdout>]',
    {
      executableFile: fileURLToPath(new URL('./commands/pull-schema.js', import.meta.url)),
    }
  )

  .command(
    'reset [types]',
    'wipe out all data in the database {BE CAREFUL!}. Defaults: [types: functions,indexes,roles,documents,collections,databases,schemas]',
    {
      executableFile: fileURLToPath(new URL('./commands/reset.js', import.meta.url)),
    }
  )

program.parse(process.argv)
