import fs from 'fs'
import path from 'path'
import debug from 'debug'
import tempy from 'tempy'
import execa from 'execa'
import globby from 'globby'
import faunadb from 'faunadb'
import resolve from 'resolve-as-bin'
import { performance } from 'perf_hooks'
import fetch, { Headers } from 'node-fetch'
import { fileURLToPath } from 'url'

const { Client } = faunadb
const errors = {
  CACHE_TIMEOUT:
    'Value is cached. Please wait at least 60 seconds after creating or renaming a collection or index before reusing its name.',
}

export const ignored = process.env.FAUGRA_IGNORE
  ? process.env.FAUGRA_IGNORE.split(',')
  : ['**/node_modules/**', '**/.git/**']

export const graphqlEndpoint = (() => {
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

export const findBin = (name) => {
  const local = fileURLToPath(new URL(path.join(`./node_modules/.bin`, name), import.meta.url))

  return fs.existsSync(local) ? local : resolve(name)
}

export const loadSecret = () => {
  const secret = process.env.FAUGRA_SECRET

  if (!secret) {
    console.error(
      `The faugra secret is missing! 🤷‍🥚\n\nPlease define a secret to get started. 💁🐣\n ↳ read more on https://github.com/zvictor/faugra/wiki/Faugra-secret\n`
    )

    throw new Error(`missing faugra's secret`)
  }

  return secret
}

export const faunaClient = () => {
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

export const patternMatch = (pattern) =>
  globby(pattern, {
    cwd: process.cwd(),
    ignore: ignored,
  })

export const locateCache = (file) =>
  fileURLToPath(new URL(path.join(`.cache/`, file), import.meta.url))

export const runFQL = (query) => {
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

  const { stdout, stderr, exitCode } = execa.sync(findBin(`fauna`), args, {
    cwd: path.dirname(fileURLToPath(import.meta.url)),
  })

  if (exitCode) {
    debug('faugra:runFQL')(`The query has failed to execute.`)
    console.error(stderr)

    throw new Error(`runFQL failed with exit code ${exitCode}`)
  }

  debug('faugra:runFQL')(`The query has been executed`)
  return JSON.parse(stdout)
}

export const importSchema = async (schema, override) => {
  debug('faugra:importSchema')(
    `Pushing the schema to ${graphqlEndpoint.import} in ${override ? 'OVERRIDE' : 'NORMAL'} mode`
  )

  const t0 = performance.now()
  const response = await fetch(`${graphqlEndpoint.import}${override ? '?mode=override' : ''}`, {
    method: 'POST',
    body: schema,
    headers: new Headers({
      Authorization: `Bearer ${loadSecret()}`,
    }),
  })
  debug('faugra:importSchema')(`The call to fauna took ${performance.now() - t0} milliseconds.`)

  const message = await response.text()
  if (response.status !== 200) {
    if (!message.endsWith(errors.CACHE_TIMEOUT)) {
      throw new Error(message)
    }

    console.log(`Wiped data still found in fauna's cache.\nCooling down for 30s...`)
    await sleep(30000)
    console.log(`Retrying now...`)

    return await importSchema(schema, override)
  }

  return message
}

export const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout))

export const pipeData = new Promise((resolve, reject) => {
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
