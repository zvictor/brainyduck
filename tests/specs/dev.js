import { resolve } from 'path'
import execa from 'execa'
import reset from '../../commands/reset'

beforeEach(() => reset(), 120000)

test(`complete all 'dev' operations for the 'basic' example`, () => {
  const cwd = resolve(`${__dirname}/../../examples/basic`)

  const { stdout, stderr, exitCode } = execa.sync('node', ['../../cli.js', 'dev', '--no-watch'], {
    env: { DEBUG: '' },
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
}, 15000)

test(`complete all 'dev' operations for the 'modularized' example`, () => {
  const cwd = resolve(`${__dirname}/../../examples/modularized`)

  const { stdout, stderr, exitCode } = execa.sync('node', ['../../cli.js', 'dev', '--no-watch'], {
    env: { DEBUG: '' },
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
}, 15000)

test(`complete all 'dev' operations for the 'with-UDF' example`, () => {
  const cwd = resolve(`${__dirname}/../../examples/with-UDF`)

  const { stdout, stderr, exitCode } = execa.sync('node', ['../../cli.js', 'dev', '--no-watch'], {
    env: { DEBUG: '' },
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
}, 15000)
