import { resolve } from 'path'
import execa from 'execa'
import test from 'ava'

test('UDF name should match file name', async (t) => {
  const cwd = resolve(`${__dirname}/../fixtures`)

  const error = await t.throwsAsync(() =>
    execa('node', ['../../index.js', 'define-functions', 'unmatched.udf'], {
      env: { DEBUG: 'faugra:*' },
      cwd,
    })
  )

  t.true(error.message.includes('Error: File name does not match function name: unmatched'))
  t.is(error.exitCode, 1)
})

test('upload simplified and extended UDFs: sayHi, sayHello', async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/with-UDF`)
  t.timeout(15000)

  const { stdout, exitCode } = await execa('node', ['../../index.js', 'define-functions'], {
    env: { DEBUG: 'faugra:*' },
    cwd,
  })

  t.is(stdout, `User-defined function(s) created or updated: [ 'sayHello', 'sayHi' ]`)

  t.false(stdout.includes('error'))
  t.is(exitCode, 0)
})
