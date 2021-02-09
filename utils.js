const fs = require('fs')
const path = require('path')
const debug = require('debug')
const tempy = require('tempy')
const execa = require('execa')
const globby = require('globby')
const fetch = require('node-fetch')
const resolve = require('resolve-as-bin')
const { performance } = require('perf_hooks')
const { Client } = require('faunadb')

const ignored = process.env.FAUGRA_IGNORE
  ? process.env.FAUGRA_IGNORE.split(',')
  : ['**/node_modules/**', '**/.git/**']

let faunaShell = path.join(__dirname, `./node_modules/.bin/fauna`)
if (!fs.existsSync(faunaShell)) {
  faunaShell = resolve('fauna')
}

const graphqlEndpoint = (() => {
  const {
    FAUGRA_GRAPHQL_DOMAIN = 'graphql.fauna.com',
    FAUGRA_SCHEME = 'https',
    FAUGRA_GRAPHQL_PORT,
  } = process.env

  const base = `${FAUGRA_SCHEME}://${FAUGRA_GRAPHQL_DOMAIN}${
    FAUGRA_GRAPHQL_PORT ? `:${FAUGRA_GRAPHQL_PORT}` : ``
  }`
  return { server: `${base}/graphql`, import: `${base}/import` }
})()

const loadSecret = () => {
  const secret = process.env.FAUGRA_SECRET

  if (!secret) {
    console.error(
      `The faugra secret is missing! 🤷‍🥚\n\nPlease define a secret to get started. 💁🐣\n ↳ read more on https://github.com/zvictor/faugra/wiki/Faugra-secret\n`
    )

    throw new Error(`missing faugra's secret`)
  }

  return secret
}

const faunaClient = () => {
  const { FAUGRA_DOMAIN, FAUGRA_SCHEME, FAUGRA_PORT } = process.env
  const options = { secret: loadSecret() }

  if (FAUGRA_DOMAIN) {
    options.domain = process.env.FAUGRA_DOMAIN
  }

  if (FAUGRA_SCHEME) {
    options.scheme = process.env.FAUGRA_SCHEME
  }

  if (FAUGRA_PORT) {
    options.port = process.env.FAUGRA_PORT
  }

  return new Client(options)
}

const patternMatch = (pattern) =>
  globby(pattern, {
    cwd: process.cwd(),
    ignore: ignored,
  })

const locateCache = (file) => path.join(__dirname, '.cache/', file)

const runFQL = (query) => {
  debug('faugra:runFQL')(`Executing query:\n${query}`)
  const { FAUGRA_DOMAIN, FAUGRA_PORT, FAUGRA_SCHEME } = process.env

  const tmpFile = tempy.file()
  fs.writeFileSync(tmpFile, query, 'utf8')

  const args = [`eval`, `--secret=${loadSecret()}`, `--file=${tmpFile}`]

  if (FAUGRA_DOMAIN) {
    args.push('--domain')
    args.push(FAUGRA_DOMAIN)
  }

  if (FAUGRA_PORT) {
    args.push('--port')
    args.push(FAUGRA_PORT)
  }

  if (FAUGRA_SCHEME) {
    args.push('--scheme')
    args.push(FAUGRA_SCHEME)
  }

  const { stdout, stderr, exitCode } = execa.sync(faunaShell, args, {
    cwd: __dirname,
  })

  if (exitCode) {
    debug('faugra:runFQL')(`The query has failed to execute.`)
    console.error(stderr)

    throw new Error(`runFQL failed with exit code ${exitCode}`)
  }

  debug('faugra:runFQL')(`The query has been executed`)
  return JSON.parse(stdout)
}

const importSchema = async (schema, override) => {
  debug('faugra:importSchema')(
    `Pushing the schema to ${graphqlEndpoint.import} in ${override ? 'OVERRIDE' : 'NORMAL'} mode`
  )

  const t0 = performance.now()
  const response = await fetch(`${graphqlEndpoint.import}${override ? '?mode=override' : ''}`, {
    method: 'POST',
    body: schema,
    headers: new fetch.Headers({
      Authorization: `Bearer ${loadSecret()}`,
    }),
  })
  debug('faugra:importSchema')(`The call to fauna took ${performance.now() - t0} milliseconds.`)

  const message = await response.text()
  if (response.status !== 200) {
    throw new Error(message)
  }

  return message
}

const pipeData = new Promise((resolve, reject) => {
  const stdin = process.openStdin()
  let data = ''

  stdin.on('data', function (chunk) {
    data += chunk
  })

  stdin.on('error', function (e) {
    reject(e)
  })

  stdin.on('end', function () {
    resolve(data)
  })
})

module.exports = {
  ignored,
  graphqlEndpoint,
  loadSecret,
  faunaClient,
  patternMatch,
  locateCache,
  runFQL,
  importSchema,
  pipeData,
}
