#!/usr/bin/env node

import fs from 'fs'
import resolve from 'resolve-cwd'
import { program } from 'commander'
import { constantCase } from 'constant-case'
import { fileURLToPath } from 'node:url'
import { patterns } from './utils.js'

let locallyInstalled = false
try {
  locallyInstalled = Boolean(resolve('brainyduck/utils'))
} catch (e) {}

const findCommandFile = (commandName) =>
  locallyInstalled
    ? resolve(`brainyduck/${commandName}`)
    : fileURLToPath(new URL(`./commands/${commandName}.js`, import.meta.url))

const prefix = {
  FAUNA: 'FAUNA',
  BRAINYDUCK: 'BRAINYDUCK',
}

const pkg = JSON.parse(
  await fs.readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)))
)

const optionParser =
  (key, _prefix = prefix.BRAINYDUCK) =>
  () => {
    let name = constantCase(key)
    if (_prefix) {
      name = `${_prefix}_${name}`
    }

    return (process.env[name] = program.opts()[key])
  }

program
  .version(pkg.version)

  .hook('preSubcommand', (thisCommand, subcommand) => {
    if (['build', 'pack', 'export', 'dev'].includes(subcommand._name) && !locallyInstalled) {
      console.error(
        `Looks like brainyduck is not installed locally and the command '${subcommand._name}' requires a local installation.\nHave you installed brainyduck globally instead?`
      )
      throw new Error('You must install brainyduck locally.')
    }
  })

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
    process.env.BRAINYDUCK_NO_OPERATIONS_GENERATION = !this.operationsGeneration
  })

  .option(
    '-f, --force <value>',
    `skip prompt confirmations (defaults to <BRAINYDUCK_FORCE or true).`
  )
  .on('option:force', optionParser('force'))

  .option(
    '-i, --ignore <value>',
    `set glob patterns to exclude matches (defaults to <BRAINYDUCK_IGNORE or '**/node_modules/**,**/.git/**'>).`
  )
  .on('option:ignore', optionParser('ignore'))

  .option('--no-watch', `disable the files watcher (only used in the dev command).`)
  .on('option:no-watch', function () {
    process.env.BRAINYDUCK_NO_WATCH = !this.watch
  })

  .option(
    '--only-changes',
    `ignore initial files and watch changes ONLY (only used in the dev command).`
  )
  .on('option:only-changes', optionParser('onlyChanges'))

  .option(
    '--callback <command>',
    `run external command after every execution completion (only used in the dev command).`
  )
  .on('option:callback', optionParser('callback'))

  .option('--tsconfig', `use a custom tsconfig file for the sdk transpilation.`)
  .on('option:tsconfig', function () {
    process.env.BRAINYDUCK_TSCONFIG = this.tsconfig
  })

  .option('--verbose', `run the command with verbose logging.`)
  .on('option:verbose', function () {
    process.env.DEBUG = 'brainyduck:*'
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
    'code generator that creates an easily accessible API. Defaults: [schemas-pattern: **/[A-Z]*.(graphql|gql), documents-pattern: **/[a-z]*.(graphql|gql) output: <node_modules/brainyduck/.cache>]',
    {
      executableFile: findCommandFile(`build`),
    }
  )

  .command('export [destination]', 'export the built module as an independent node package', {
    executableFile: findCommandFile(`export`),
  })

  .command('pack', 'create a tarball from the built module', {
    executableFile: findCommandFile(`pack`),
  })

  .command('dev [directory]', 'build, deploy and watch for changes. Defaults: [directory: <pwd>]', {
    executableFile: findCommandFile(`dev`),
    isDefault: true,
  })

  .command(
    'deploy [types]',
    'deploy the local folder to your database. Defaults: [types: schemas,functions,indexes,roles]',
    {
      executableFile: findCommandFile(`deploy`),
    }
  )

  .command(
    'deploy-schemas [pattern]',
    'push your schema to faunadb. Defaults: [pattern: **/*.(graphql|gql)]',
    {
      executableFile: findCommandFile(`deploy-schemas`),
    }
  )

  .command(
    'deploy-functions [pattern]',
    `upload your User-Defined Functions (UDF) to faunadb. Defaults: [pattern: ${patterns.UDF}]`,
    {
      executableFile: findCommandFile(`deploy-functions`),
    }
  )

  .command(
    'deploy-indexes [pattern]',
    `upload your User-Defined Indexes to faunadb. Defaults: [pattern: ${patterns.INDEX}]`,
    {
      executableFile: findCommandFile(`deploy-indexes`),
    }
  )

  .command(
    'deploy-roles [pattern]',
    `upload your User-Defined Roles (UDR) to faunadb. Defaults: [pattern: ${patterns.UDR}]`,
    {
      executableFile: findCommandFile(`deploy-roles`),
    }
  )

  .command(
    'pull-schema [output]',
    'load the schema hosted in faunadb. Defaults: [output: <stdout>]',
    {
      executableFile: findCommandFile(`pull-schema`),
    }
  )

  .command(
    'reset [types]',
    'wipe out all data in the database {BE CAREFUL!}. Defaults: [types: functions,indexes,roles,documents,collections,databases,schemas]',
    {
      executableFile: findCommandFile(`reset`),
    }
  )

program.parse(process.argv)
