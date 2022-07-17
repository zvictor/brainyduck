import { execaSync } from 'execa'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { setupEnvironment, load, amountOfFunctionsCreated } from '../testUtils.js'

setupEnvironment(`deploy-functions`)

test('UDF name should match file name', async () => {
  const cwd = resolve(fileURLToPath(new URL(`../fixtures`, import.meta.url)))

  try {
    execaSync('node', ['../../cli.js', 'deploy-functions', 'unmatched.udf'], {
      env: { DEBUG: 'brainyduck:*', FAUNA_SECRET: load('FAUNA_SECRET') },
      cwd,
    })

    fail('it should not reach here')
  } catch (e) {
    expect(e.message).toEqual(
      expect.stringContaining('Error: File name does not match function name: unmatched')
    )
    expect(e.exitCode).toBe(1)
  }

  expect(await amountOfFunctionsCreated()).toBe(0)
})

test('upload simplified and extended UDFs: sayHi, sayHello', async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/with-UDF`, import.meta.url)))

  const { stdout, stderr, exitCode } = execaSync('node', ['../../cli.js', 'deploy-functions'], {
    env: { DEBUG: 'brainyduck:*', FAUNA_SECRET: load('FAUNA_SECRET') },
    cwd,
  })

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(stdout).toBe(`User-defined function(s) created or updated: [ 'sayHello', 'sayHi' ]`)
  expect(exitCode).toBe(0)

  expect(await amountOfFunctionsCreated()).toBe(2)
}, 15000)
