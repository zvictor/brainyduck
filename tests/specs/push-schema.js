import execa from 'execa'
import { resolve } from 'path'
import { serial as test } from 'ava'
// import reset from '../../commands/reset'

// test.beforeEach(() => reset({ schemas: true }))

test('push a basic schema', async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/basic`)
  t.timeout(35000)

  const { stdout, stderr, exitCode } = await execa('node', ['../../cli.js', 'push-schema'], {
    env: { DEBUG: 'faugra:*' },
    cwd,
  })

  const mergedSchema = `The resulting merged schema:
\ttype User {
\t  username: String! @unique
\t}
\ttype Query {
\t  allUsers: [User!]
\t}`

  t.true(stderr.includes(mergedSchema))
  t.is(stdout.split('\n')[0], `Schema imported successfully.`)

  t.false(stdout.includes('error'))
  t.is(exitCode, 0)
})

test('push a modular schema', async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/modularized`)
  t.timeout(35000)

  const { stdout, stderr, exitCode } = await execa('node', ['../../cli.js', 'push-schema'], {
    env: { DEBUG: 'faugra:*' },
    cwd,
  })
  const mergedSchema = `The resulting merged schema:
\ttype Query {
\t  allPosts: [Post!]
\t  sayHello(name: String!): String! @resolver(name: "sayHello")
\t}
\ttype Post {
\t  title: String!
\t  content: String!
\t  author: User!
\t}
\ttype User {
\t  name: String!
\t}`

  t.true(stderr.includes(mergedSchema))
  t.is(stdout.split('\n')[0], `Schema imported successfully.`)

  t.false(stdout.includes('error'))
  t.is(exitCode, 0)
})
