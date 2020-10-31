import execa from 'execa'
import { serial as test } from 'ava'
import { importSchema } from '../../utils'
import reset from '../../commands/reset'

test.beforeEach(() => reset({ schemas: true }))

test('fetch schema from fauna', async (t) => {
  t.timeout(65000)

  const schema = `
  type User {
    username: String! @unique
  }`

  // The schema needs to be pre-populated/reset before we can pull it again
  await importSchema(schema, true)

  const { stdout, exitCode } = await execa('node', ['../../cli.js', 'pull-schema'], {
    env: { DEBUG: 'faugra:*' },
    cwd: __dirname,
  })

  // const expectedSchema = `type User {
  //   username: String! @unique
  // }`

  t.false(stdout.includes('error'))
  // t.is(stdout, expectedSchema)
  t.is(exitCode, 0)
})
