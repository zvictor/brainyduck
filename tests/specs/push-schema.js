import execa from 'execa'
import { resolve } from 'path'
import { serial as test } from 'ava'

test('upload a basic schema', async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/basic`)
  t.timeout(35000)

  const { stdout, stderr, exitCode } = await execa('node', ['../../index.js', 'push-schema'], {
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
