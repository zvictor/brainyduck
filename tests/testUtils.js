import fs from 'fs'
import _debug from 'debug'
import faunadb from 'faunadb'
import { faunaClient, runFQL } from '../utils.js'

const { query: q } = faunadb
const debug = _debug('faugra:test')

export const createDatabase = (name, secret) =>
  runFQL(`
  CreateKey({
    database: Select('ref', CreateDatabase({ name: '${name}' })),
    role: 'admin',
  })
`, secret)

export const deleteDatabase = (name, secret) => runFQL(`Delete(Database('${name}'))`, secret)

export const setupEnvironment = (name) => {
  const timestamp = +new Date()

  beforeAll(() => {
    process.env.FAUGRA_SECRET = createDatabase(
      `${timestamp}_${name}`,
      process.env.MASTER_SECRET
    ).secret
    debug(`Using database ${timestamp}_${name}`)
  })

  afterAll(() => {
    deleteDatabase(`${timestamp}_${name}`, process.env.MASTER_SECRET)
    delete process.env.FAUGRA_CACHE
  })
  debug(`Deleted database ${timestamp}_${name}`)
}

export const amountOfFunctionsCreated = () =>
  faunaClient().query(q.Count(q.Functions()))

export const amountOfRolesCreated = () =>
  faunaClient().query(q.Count(q.Roles()))

export const amountOfCollectionsCreated = () =>
  faunaClient().query(q.Count(q.Collections()))

export const listFiles = (directory) =>
  fs.existsSync(directory)
    ? fs
        .readdirSync(directory, { withFileTypes: true })
        .filter((dirent) => dirent.isFile())
        .map((x) => x.name)
    : []

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
