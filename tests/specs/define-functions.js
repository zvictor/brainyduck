import { resolve } from 'path'
import execa from 'execa'
import ava from 'ava'

ava('upload all UDF: sayHello', async (t) => {
  const basePath = resolve(`${__dirname}/../../examples/basic`)
  process.chdir(basePath)
  t.timeout(5000)

  try {
    const { stdout, exitCode } = await execa('node', ['../../index.js', 'define-functions'])

    t.is(stdout, `User-defined function(s) created or updated: [ 'sayHello' ]`)

    t.false(stdout.includes('error'))
    t.is(exitCode, 0)
  } catch (error) {
    t.fail(`build failed with ${error}`)
  }
})
