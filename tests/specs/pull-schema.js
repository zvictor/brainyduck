import ava from 'ava'
import execa from 'execa'
import fetch from 'node-fetch'

const { FAUGRA_SECRET, FAUGRA_DOMAIN = 'https://graphql.fauna.com' } = process.env

const prepopulate = async (schema) => {
  // The schema needs to be pre-populated/reset before we can pull them again
  const response = await fetch(`${FAUGRA_DOMAIN}/import?mode=override`, {
    method: 'POST',
    body: schema,
    headers: new fetch.Headers({
      Authorization: `Bearer ${FAUGRA_SECRET}`,
    }),
  })

  const message = await response.text()
  if (response.status !== 200) {
    throw new Error(message)
  }

  return message
}

ava('upload all schema', async (t) => {
  t.timeout(65000)

  const schema = `
  type User {
    username: String! @unique
  }`

  await prepopulate(schema)

  const { stdout, stderr, exitCode } = await execa('node', ['../../index.js', 'pull-schema'], {
    cwd: __dirname,
  })
  console.log({ stdout, stderr, exitCode })

  // const expectedSchema = `type User {
  //   username: String! @unique
  // }`

  t.false(stdout.includes('error'))
  // t.is(stdout, expectedSchema)
  t.is(exitCode, 0)
})
