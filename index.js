#!/usr/bin/env node

const path = require('path')
const { program } = require('commander')
const package = require('./package.json')

process.env.DEBUG = process.env.DEBUG || '*'

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
    'upload your User-Defined Functions (UDF) to faunadb. Defaults: [pattern: **/*.fql]',
    {
      executableFile: path.join(__dirname, './commands/define-functions.js'),
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
    'push your schema to faunadb. Defaults: [pattern: **/*.gql,**/*.graphql,!node_modules]',
    {
      executableFile: path.join(__dirname, './commands/push-schema.js'),
    }
  )

  .command(
    'generate-types [pattern] [output]',
    'code generator that converts graphql schemas into typescript types. Defaults: [pattern: **/*.gql,**/*.graphql,!node_modules, output: <stdout>]',
    {
      executableFile: path.join(__dirname, './commands/generate-types.js'),
    }
  )

program.parse(process.argv)
