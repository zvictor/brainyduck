import { resolve } from 'path'
import execa from 'execa'
import test from 'ava'

test('upload all UDF: sayHello', async (t) => {
  const basePath = resolve(`${__dirname}/../../examples/basic`)
  process.chdir(basePath)
  t.timeout(5000)

  const { stdout, exitCode } = await execa('node', ['../../index.js', 'define-functions'])

  t.is(stdout, `User-defined function(s) created or updated: [ 'sayHello' ]`)

  t.false(stdout.includes('error'))
  t.is(exitCode, 0)
})
