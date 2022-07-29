import fs from 'fs-extra'
import path from 'node:path'
import _debug from 'debug'
import faunadb from 'faunadb'
import { execaSync } from 'execa'
import { paramCase } from 'param-case'
import { fileURLToPath } from 'node:url'
import { temporaryDirectory } from 'tempy'
import { faunaClient, runFQL } from '../utils.js'
import { load, store } from './storage.js'
export { load }

const { query: q } = faunadb
const debug = _debug('brainyduck:test')
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const reset = (types) =>
  execaSync('node', ['../cli.js', 'reset', types], {
    env: { FAUNA_SECRET: load('FAUNA_SECRET'), BRAINYDUCK_FORCE: 1 },
  })

export const createDatabase = (name, secret) =>
  runFQL(
    `CreateKey({
      database: Select('ref', CreateDatabase({ name: '${name}' })),
      role: 'admin',
    })`,
    secret
  )

export const deleteDatabase = (name, secret) => runFQL(`Delete(Database('${name}'))`, secret)

export const setupEnvironment = (name, options = {}) => {
  const timestamp = +new Date()
  const start = options.beforeAll ? beforeAll : beforeEach
  const end = options.beforeAll ? afterAll : afterEach
  let dbName = `${timestamp}_${name}`

  start(() => {
    const testName = expect.getState().currentTestName

    if (testName) {
      dbName = `${dbName}_${paramCase(testName)}`
    }

    const secret = createDatabase(dbName, process.env.TESTS_SECRET).secret
    store('FAUNA_SECRET', secret)
    debug(`Using database ${timestamp}_${name}`)
  })

  end(() => {
    deleteDatabase(dbName, process.env.TESTS_SECRET)
    debug(`Deleted database ${timestamp}_${name}`)
  })
}

const query = async (expression) => {
  const client = faunaClient({ secret: load('FAUNA_SECRET') })
  const output = await client.query(expression)

  await client.close()
  return output
}

export const amountOfFunctionsCreated = () => query(q.Count(q.Functions()))

export const amountOfRolesCreated = () => query(q.Count(q.Roles()))

export const amountOfCollectionsCreated = () => query(q.Count(q.Collections()))

export const listDirectory = (directory, filter) =>
  fs.existsSync(directory)
    ? fs
        .readdirSync(directory, { withFileTypes: true })
        .filter(filter)
        .map((x) => x.name)
    : []

export const listFiles = (directory) => listDirectory(directory, (dirent) => dirent.isFile())
export const listSubfolders = (directory) =>
  listDirectory(directory, (dirent) => dirent.isDirectory())
export const listSymbolicLinks = (directory) =>
  listDirectory(directory, (dirent) => dirent.isSymbolicLink())

export const removeRetryMessages = (stdout) =>
  stdout
    .split('\n')
    .filter(
      (x) =>
        ![
          `Wiped data still found in fauna's cache.`,
          `Cooling down for 30s...`,
          `Retrying now...`,
        ].includes(x)
    )
    .join('\n')

export const clone = () => {
  const tempDir = temporaryDirectory({ prefix: 'brainyduck_' })
  const brainyduck = path.join(__dirname, '..')
  debug(`Cloning installation into ${tempDir}`)

  fs.copySync(brainyduck, tempDir, {
    filter: (src) =>
      (!src.includes('/.') || src.includes('/.npmrc')) &&
      !src.includes('node_modules') &&
      !src.includes('/build/'),
  })

  execaSync('pnpm', ['install'], { cwd: tempDir })
  return tempDir
}
