import { resolve } from 'path'
import execa from 'execa'
import test from 'ava'

test(`complete all 'dev' operations for the 'basic' example`, async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/basic`)
  t.timeout(15000)

  const { stdout, stderr, exitCode } = await execa(
    'node',
    ['../../index.js', 'dev', '--no-watch'],
    {
      env: { DEBUG: '' },
      cwd,
    }
  )

  t.is(stdout, 'All operations complete')
  t.false(stderr.includes('error'))
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
    )
  )

  t.is(exitCode, 0)
})

test(`complete all 'dev' operations for the 'modularized' example`, async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/modularized`)
  t.timeout(15000)

  const { stdout, stderr, exitCode } = await execa(
    'node',
    ['../../index.js', 'dev', '--no-watch'],
    {
      env: { DEBUG: '' },
      cwd,
    }
  )

  t.is(stdout, 'All operations complete')
  t.false(stderr.includes('error'))
  t.deepEqual(
    new Set(stderr.split('\n').sort()),
    new Set(
      [
        '- Processing Query.gql [Schema]',
        '✔ Processed Query.gql [Schema]',
        '- Processing blog/Post.gql [Schema]',
        '✔ Processed blog/Post.gql [Schema]',
        '- Processing blog/createPost.gql [Document]',
        '✔ Processed blog/createPost.gql [Document]',
        '- Processing blog/findPostByID.gql [Document]',
        '✔ Processed blog/findPostByID.gql [Document]',
        '- Processing accounts/User.gql [Schema]',
        '✔ Processed accounts/User.gql [Schema]',
        '- Processing accounts/sayHello.udf [UDF]',
        '✔ Processed accounts/sayHello.udf [UDF]',
        '',
      ].sort()
    )
  )

  t.is(exitCode, 0)
})

test(`complete all 'dev' operations for the 'with-UDF' example`, async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/with-UDF`)
  t.timeout(15000)

  const { stdout, stderr, exitCode } = await execa(
    'node',
    ['../../index.js', 'dev', '--no-watch'],
    {
      env: { DEBUG: '' },
      cwd,
    }
  )

  t.is(stdout, 'All operations complete')
  t.false(stderr.includes('error'))
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
    )
  )

  t.is(exitCode, 0)
})
