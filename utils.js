import fs from 'fs'
import path from 'path'
import debug from 'debug'
import faunadb from 'faunadb'
import resolve from 'resolve-as-bin'
import { execaSync } from 'execa'
import { globby } from 'globby'
import { performance } from 'perf_hooks'
import { fileURLToPath } from 'url'
import { temporaryFile } from 'tempy'
import fetch, { Headers } from './fetch-ponyfill.cjs'

export { default as locateCache } from './locateCache.cjs'

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
    FAUNA_GRAPHQL_DOMAIN = 'graphql.fauna.com',
    FAUNA_SCHEME = 'https',
    FAUNA_GRAPHQL_PORT,
  } = process.env

  const base = `${FAUNA_SCHEME}://${FAUNA_GRAPHQL_DOMAIN}${
    FAUNA_GRAPHQL_PORT ? `:${FAUNA_GRAPHQL_PORT}` : ``
  }`
  return { server: `${base}/graphql`, import: `${base}/import` }
})()

export const findBin = (name) => {
  const local = fileURLToPath(new URL(path.join(`./node_modules/.bin`, name), import.meta.url))

  return fs.existsSync(local) ? local : resolve(name)
}

export const loadSecret = () => {
  const secret = process.env.FAUNA_SECRET

  if (!secret) {
    console.error(
      `The faugra secret is missing! 🤷‍🥚\n\nPlease define a secret to get started. 💁🐣\n ↳ read more on https://github.com/zvictor/faugra/wiki/Faugra-secret\n`
    )

    throw new Error(`missing faugra's secret`)
  }

  return secret
}

export const faunaClient = () => {
  const { FAUNA_DOMAIN, FAUNA_SCHEME, FAUNA_PORT } = process.env
  const options = { secret: loadSecret() }

  if (FAUNA_DOMAIN) {
    options.domain = process.env.FAUNA_DOMAIN
  }

  if (FAUNA_SCHEME) {
    options.scheme = process.env.FAUNA_SCHEME
  }

  if (FAUNA_PORT) {
    options.port = process.env.FAUNA_PORT
  }

  return new Client(options)
}

export const patternMatch = async (pattern, cwd = process.cwd()) =>
  (await globby(pattern, { cwd, ignore: ignored })).map((x) => path.join(cwd, x))

export const runFQL = (query, secret) => {
  debug('faugra:runFQL')(`Executing query:\n${query}`)
  const { FAUNA_DOMAIN, FAUNA_PORT, FAUNA_SCHEME } = process.env

  const tmpFile = temporaryFile()
  fs.writeFileSync(tmpFile, query, 'utf8')

  const args = [`eval`, `--secret=${secret || loadSecret()}`, `--file=${tmpFile}`]

  if (FAUNA_DOMAIN) {
    args.push('--domain')
    args.push(FAUNA_DOMAIN)
  }

  if (FAUNA_PORT) {
    args.push('--port')
    args.push(FAUNA_PORT)
  }

  if (FAUNA_SCHEME) {
    args.push('--scheme')
    args.push(FAUNA_SCHEME)
  }

  const { stdout, stderr, exitCode } = execaSync(findBin(`fauna`), args, {
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
