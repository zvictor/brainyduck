import { resolve } from 'path'
import execa from 'execa'
import test from 'ava'

test('role name should match file name', async (t) => {
  const cwd = resolve(`${__dirname}/../fixtures`)

  const error = await t.throwsAsync(() =>
    execa('node', ['../../index.js', 'define-roles', 'unmatched.role'], {
      env: { DEBUG: 'faugra:*' },
      cwd,
    })
  )

  t.true(error.message.includes('Error: File name does not match role name: unmatched'))
  t.is(error.exitCode, 1)
})

test('upload all roles: publicAccess', async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/with-UDF`)
  t.timeout(15000)

  // the referred functions needs to be defined first
  await execa('node', ['../../index.js', 'define-functions'], {
    env: { DEBUG: 'faugra:*' },
    cwd,
  })

  // ... and then their access permission can be defined
  const { stdout, exitCode } = await execa('node', ['../../index.js', 'define-roles'], {
    env: { DEBUG: 'faugra:*' },
    cwd,
  })

  t.is(stdout, `User-defined role(s) created or updated: [ 'publicAccess' ]`)

  t.false(stdout.includes('error'))
  t.is(exitCode, 0)
})
