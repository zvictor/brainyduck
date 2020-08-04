import { resolve } from 'path'
import execa from 'execa'
import test from 'ava'

test('upload all UDF: sayHello', async (t) => {
  const cwd = resolve(`${__dirname}/../../examples/with-UDF`)
  t.timeout(15000)

  const { stdout, exitCode } = await execa('node', ['../../index.js', 'define-functions'], {
    cwd,
  })

  t.is(stdout, `User-defined function(s) created or updated: [ 'sayHello' ]`)

  t.false(stdout.includes('error'))
  t.is(exitCode, 0)
})
