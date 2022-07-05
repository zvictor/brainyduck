import { execaSync } from 'execa'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import reset from '../../commands/reset'
import { setupEnvironment, amountOfFunctionsCreated, amountOfRolesCreated } from '../testUtils.js'

setupEnvironment(`deploy-roles`)

beforeEach(() => reset({ functions: true, roles: true }), 10000)

test('role definitions should not accept simplified formats', async () => {
  const cwd = resolve(fileURLToPath(new URL(`../fixtures`, import.meta.url)))

  try {
    execaSync('node', ['../../cli.js', 'deploy-roles', 'simplified.role'], {
      env: { DEBUG: 'faugra:*' },
      cwd,
    })

    fail('it should not reach here')
  } catch (error) {
    expect(error.message).toEqual(
      expect.stringContaining('Error: Incorrect syntax used in role definition')
    )
    expect(error.exitCode).toBe(1)
  }

  expect(await amountOfRolesCreated()).toBe(0)
})

test('role name should match file name', async () => {
  const cwd = resolve(fileURLToPath(new URL(`../fixtures`, import.meta.url)))

  try {
    execaSync('node', ['../../cli.js', 'deploy-roles', 'unmatched.role'], {
      env: { DEBUG: 'faugra:*' },
      cwd,
    })

    fail('it should not reach here')
  } catch (error) {
    expect(error.message).toEqual(
      expect.stringContaining('Error: File name does not match role name: unmatched')
    )
    expect(error.exitCode).toBe(1)
  }

  expect(await amountOfRolesCreated()).toBe(0)
})

test('upload all roles: publicAccess', async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/with-UDF`, import.meta.url)))

  // the referred functions needs to be defined first
  const functions = execaSync('node', ['../../cli.js', 'deploy-functions'], {
    env: { DEBUG: 'faugra:*' },
    cwd,
  })

  expect(functions.stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(functions.stdout).toEqual(expect.not.stringMatching(/error/i))
  expect(functions.stdout).toBe(
    `User-defined function(s) created or updated: [ 'sayHello', 'sayHi' ]`
  )

  expect(await amountOfFunctionsCreated()).toBe(2)

  // ... and only then their access permission can be defined
  const roles = execaSync('node', ['../../cli.js', 'deploy-roles'], {
    env: { DEBUG: 'faugra:*' },
    cwd,
  })

  expect(roles.stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(roles.stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(roles.stdout).toBe(`User-defined role(s) created or updated: [ 'publicAccess' ]`)
  expect(roles.exitCode).toBe(0)

  expect(await amountOfRolesCreated()).toBe(1)
}, 15000)
