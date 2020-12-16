import { resolve } from 'path'
import execa from 'execa'
import reset from '../../commands/reset'

beforeEach(() => reset({ functions: true }), 10000)

test('UDF name should match file name', () => {
  const cwd = resolve(`${__dirname}/../fixtures`)

  try {
    execa.sync('node', ['../../cli.js', 'define-functions', 'unmatched.udf'], {
      env: { DEBUG: 'faugra:*' },
      cwd,
    })

    fail('it should not reach here')
  } catch (e) {
    expect(e.message).toEqual(
      expect.stringContaining('Error: File name does not match function name: unmatched')
    )
    expect(e.exitCode).toBe(1)
  }
})

test('upload simplified and extended UDFs: sayHi, sayHello', () => {
  const cwd = resolve(`${__dirname}/../../examples/with-UDF`)

  const { stdout, stderr, exitCode } = execa.sync('node', ['../../cli.js', 'define-functions'], {
    env: { DEBUG: 'faugra:*' },
    cwd,
  })

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(stdout).toBe(`User-defined function(s) created or updated: [ 'sayHello', 'sayHi' ]`)
  expect(exitCode).toBe(0)
}, 15000)
