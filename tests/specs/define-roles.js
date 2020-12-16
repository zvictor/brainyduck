import { resolve } from 'path'
import execa from 'execa'
import reset from '../../commands/reset'

beforeEach(() => reset({ roles: true }), 10000)

test('role definitions should not accept simplified formats', () => {
  const cwd = resolve(`${__dirname}/../fixtures`)

  try {
    execa.sync('node', ['../../cli.js', 'define-roles', 'simplified.role'], {
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
})

test('role name should match file name', () => {
  const cwd = resolve(`${__dirname}/../fixtures`)

  try {
    execa.sync('node', ['../../cli.js', 'define-roles', 'unmatched.role'], {
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
})

test('upload all roles: publicAccess', () => {
  const cwd = resolve(`${__dirname}/../../examples/with-UDF`)

  // the referred functions needs to be defined first
  const functions = execa.sync('node', ['../../cli.js', 'define-functions'], {
    env: { DEBUG: 'faugra:*' },
    cwd,
  })

  expect(functions.stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(functions.stdout).toEqual(expect.not.stringMatching(/error/i))
  expect(functions.stdout).toBe(
    `User-defined function(s) created or updated: [ 'sayHello', 'sayHi' ]`
  )

  // ... and only then their access permission can be defined
  const roles = execa.sync('node', ['../../cli.js', 'define-roles'], {
    env: { DEBUG: 'faugra:*' },
    cwd,
  })

  expect(roles.stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(roles.stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(roles.stdout).toBe(`User-defined role(s) created or updated: [ 'publicAccess' ]`)
  expect(roles.exitCode).toBe(0)
}, 15000)
