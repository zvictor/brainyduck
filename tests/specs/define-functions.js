import { resolve } from 'path'
import execa from 'execa'
import ava from 'ava'

ava('upload all UDF: sayHello', async (t) => {
  const basePath = resolve(`${__dirname}/../../examples/basic`)
  process.chdir(basePath)

  try {
    const { stdout } = await execa('node', ['../../index.js', 'define-functions'], {
      encoding: 'utf8',
      cwd: basePath,
    })

    t.false(stdout.includes('error'))
    t.is(stdout, `User-defined function(s) created or updated: [ 'sayHello' ]`)
  } catch (error) {
    t.fail(`build failed with ${error}`)
  }
})
