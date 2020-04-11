import { resolve } from 'path'
import execa from 'execa'
import ava from 'ava'

ava('upload all schema', async (t) => {
  const basePath = resolve(`${__dirname}/../../examples/basic`)
  process.chdir(basePath)
  t.timeout(35000)

  const { stdout, stderr, exitCode } = await execa('node', ['../../index.js', 'push-schema'])
  const mergedSchema = `The resulting merged schema:
\ttype Query {
\t  allUsers: [User!]
\t  sayHello(name: String!): String! @resolver(name: "sayHello")
\t}
\ttype User {
\t  username: String! @unique
\t}`

  t.true(stderr.includes(mergedSchema))
  t.is(stdout.split('\n')[0], `Schema imported successfully.`)

  t.false(stdout.includes('error'))
  t.is(exitCode, 0)
})
