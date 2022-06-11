import fs from 'fs'
import tempy from 'tempy'
import faunadb from 'faunadb'
import { faunaClient, runFQL } from '../utils.js'

const { query: q } = faunadb

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

    process.env.FAUGRA_EXCLUSIVE_SECRET = createDatabase(
      `${timestamp}_${name}_dry-run`,
      process.env.MASTER_SECRET
    ).secret
  })

  afterAll(() => {
    deleteDatabase(`${timestamp}_${name}`, process.env.MASTER_SECRET)
    deleteDatabase(`${timestamp}_${name}_dry-run`, process.env.MASTER_SECRET)
    delete process.env.FAUGRA_CACHE
  })
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
