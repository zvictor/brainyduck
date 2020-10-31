import { resolve } from 'path'
import execa from 'execa'
import test from 'ava'
import reset from '../../commands/reset'

test.beforeEach(() => reset())

test(`complete all 'dev' operations for the 'basic' example`, async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/basic`)
  t.timeout(15000)

  const { stdout, stderr, exitCode } = await execa('node', ['../../cli.js', 'dev', '--no-watch'], {
    env: { DEBUG: '' },
    cwd,
  })

  t.is(stdout, 'All operations complete')
  t.false(stderr.includes('error'), stderr)
  t.deepEqual(
    new Set(stderr.split('\n').sort()),
    new Set(
      [
        '- Processing Schema.graphql [Schema]',
        '✔ Processed Schema.graphql [Schema]',
        '- Processing queries.gql [Document]',
        '✔ Processed queries.gql [Document]',
        '',
      ].sort()
    ),
    stderr
  )

  t.is(exitCode, 0)
})

test(`complete all 'dev' operations for the 'modularized' example`, async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/modularized`)
  t.timeout(15000)

  const { stdout, stderr, exitCode } = await execa('node', ['../../cli.js', 'dev', '--no-watch'], {
    env: { DEBUG: '' },
    cwd,
  })

  t.is(stdout, 'All operations complete')
  t.false(stderr.includes('error'), stderr)
  t.deepEqual(
    new Set(stderr.split('\n').sort()),
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
    ),
    stderr
  )

  t.is(exitCode, 0)
})

test(`complete all 'dev' operations for the 'with-UDF' example`, async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/with-UDF`)
  t.timeout(15000)

  const { stdout, stderr, exitCode } = await execa('node', ['../../cli.js', 'dev', '--no-watch'], {
    env: { DEBUG: '' },
    cwd,
  })

  t.is(stdout, 'All operations complete')
  t.false(stderr.includes('error'), stderr)
  t.deepEqual(
    new Set(stderr.split('\n').sort()),
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
    ),
    stderr
  )

  t.is(exitCode, 0)
})
