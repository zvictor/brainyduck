const fs = require('fs')
const path = require('path')
const debug = require('debug')
const tempy = require('tempy')
const execa = require('execa')
const globby = require('globby')
const fetch = require('node-fetch')
const { performance } = require('perf_hooks')
const faunaEval = require('fauna-shell/src/commands/eval')

const { FAUGRA_DOMAIN = 'https://graphql.fauna.com' } = process.env

const ignored = process.env.FAUGRA_IGNORE
  ? process.env.FAUGRA_IGNORE.split(',')
  : ['**/node_modules/**', '**/.git/**']

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

const patternMatch = (pattern) =>
  globby(pattern, {
    cwd: process.cwd(),
    ignore: ignored,
  })

const locateCache = (file) => path.join(__dirname, '.cache/', file)

const runFQL = (query) => {
  debug('faugra:runFQL')(`Executing query:\n${query}`)
  const tmpFile = tempy.file()

  fs.writeFileSync(tmpFile, query, 'utf8')

  const { stdout, stderr, exitCode } = execa.sync(
    `./node_modules/.bin/fauna`,
    [`eval`, `--secret=${loadSecret()}`, `--file=${tmpFile}`],
    {
      cwd: __dirname,
    }
  )

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
    `Pushing the schema to ${FAUGRA_DOMAIN}/import in ${override ? 'OVERRIDE' : 'NORMAL'} mode`
  )

  const t0 = performance.now()
  const response = await fetch(`${FAUGRA_DOMAIN}/import${override ? '?mode=override' : ''}`, {
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
  loadSecret,
  patternMatch,
  locateCache,
  runFQL,
  importSchema,
  pipeData,
}
