const fs = require('fs')
const path = require('path')
const debug = require('debug')
const tempy = require('tempy')
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

const runFQL = async (query) => {
  // a wrapper around faunaEval is needed because otherwise we can't easily store its output in a variable.
  // this whole method is sadly "killing a fly with a bazooka" here.

  debug('faugra:runFQL')(`Executing query:\n${query}`)
  const tmpFile = tempy.file()

  let error = false
  const { exit } = process

  process.exit = () => {
    // Avoid fauna-eval from killing the process in case of error
    // Ridiculous workaround, but what else can we do? 🤷‍♀️
    // https://github.com/fauna/fauna-shell/blob/9465b80960820b56a6b533f148f7a355338d0bd9/src/lib/misc.js#L245

    if (error) {
      return
    }

    console.error(`The FQL below failed to be executed:\n\n${query}`)
    error = new Error(`runFQL failed to run`)
  }

  await faunaEval.run([query, '--secret', loadSecret(), '--output', tmpFile])

  process.exit = exit

  if (error) {
    throw error
  }

  debug('faugra:runFQL')(`The query has been executed`)

  // temporary fix for https://github.com/fauna/fauna-shell/pull/61
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(tmpFile)
    const chunks = []

    stream.on('error', reject)
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('end', () => {
      const data = JSON.parse(Buffer.concat(chunks).toString('utf8'))

      resolve(data)
    })
  })
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
