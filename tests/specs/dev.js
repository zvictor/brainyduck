import execa from 'execa'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import reset from '../../commands/reset'
import {
  amountOfCollectionsCreated,
  amountOfRolesCreated,
  amountOfFunctionsCreated,
} from '../testUtils.js'

beforeEach(() => reset(), 240000)

test(`complete all 'dev' operations for the 'basic' example`, async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/basic`, import.meta.url)))

  const { stdout, stderr, exitCode } = execa.sync('node', ['../../cli.js', 'dev', '--no-watch'], {
    env: { DEBUG: '', NODE_OPTIONS: '--no-warnings' },
    cwd,
  })

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(new Set(stderr.split('\n').sort())).toEqual(
    new Set(
      [
        '- Processing Schema.graphql [Schema]',
        '✔ Processed Schema.graphql [Schema]',
        '- Processing queries.gql [Document]',
        '✔ Processed queries.gql [Document]',
        '',
      ].sort()
    )
  )

  expect(stdout).toEqual('All operations complete')
  expect(exitCode).toBe(0)

  expect(await amountOfRolesCreated()).toBe(0)
  expect(await amountOfFunctionsCreated()).toBe(0)
  expect(await amountOfCollectionsCreated()).toBe(1)
}, 240000)

test(`complete all 'dev' operations for the 'modularized' example`, async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/modularized`, import.meta.url)))

  const { stdout, stderr, exitCode } = execa.sync('node', ['../../cli.js', 'dev', '--no-watch'], {
    env: { DEBUG: '', NODE_OPTIONS: '--no-warnings' },
    cwd,
  })

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(new Set(stderr.split('\n').sort())).toEqual(
    new Set(
      [
        '- Processing accounts/sayHello.udf [UDF]',
        '✔ Processed accounts/sayHello.udf [UDF]',
        '- Processing Query.gql,blog/Post.gql,accounts/User.gql [Schema]',
        '✔ Processed Query.gql,blog/Post.gql,accounts/User.gql [Schema]',
        '- Processing blog/createPost.gql,blog/findPostByID.gql [Document]',
        '✔ Processed blog/createPost.gql,blog/findPostByID.gql [Document]',
        '',
      ].sort()
    )
  )

  expect(stdout).toEqual('All operations complete')
  expect(exitCode).toBe(0)

  expect(await amountOfRolesCreated()).toBe(0)
  expect(await amountOfFunctionsCreated()).toBe(1)
  expect(await amountOfCollectionsCreated()).toBe(2)
}, 240000)

test(`complete all 'dev' operations for the 'with-UDF' example`, async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/with-UDF`, import.meta.url)))

  const { stdout, stderr, exitCode } = execa.sync('node', ['../../cli.js', 'dev', '--no-watch'], {
    env: { DEBUG: '', NODE_OPTIONS: '--no-warnings' },
    cwd,
  })

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(new Set(stderr.split('\n').sort())).toEqual(
    new Set(
      [
        '- Processing Schema.graphql [Schema]',
        '✔ Processed Schema.graphql [Schema]',
        '- Processing queries.gql [Document]',
        '✔ Processed queries.gql [Document]',
        '- Processing sayHello.udf [UDF]',
        '✔ Processed sayHello.udf [UDF]',
        '- Processing sayHi.udf [UDF]',
        '✔ Processed sayHi.udf [UDF]',
        '- Processing publicAccess.role [UDR]',
        '✔ Processed publicAccess.role [UDR]',
        '',
      ].sort()
    )
  )

  expect(stdout).toEqual('All operations complete')
  expect(exitCode).toBe(0)

  expect(await amountOfRolesCreated()).toBe(1)
  expect(await amountOfFunctionsCreated()).toBe(2)
  expect(await amountOfCollectionsCreated()).toBe(0)
}, 240000)
