import { execaSync } from 'execa'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import reset from '../../commands/reset'
import {
  setupEnvironment,
  amountOfCollectionsCreated,
  amountOfRolesCreated,
  amountOfFunctionsCreated,
  removeRetryMessages,
} from '../testUtils.js'

setupEnvironment(`deploy`)

beforeEach(() => reset(), 240000)

test(`complete all 'deploy' operations for the 'basic' example`, async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/basic`, import.meta.url)))

  const { stdout, stderr, exitCode } = execaSync('node', ['../../cli.js', 'deploy'], {
    env: { DEBUG: '', FORCE_COLOR: 0, NODE_OPTIONS: '--no-warnings' },
    cwd,
  })

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(new Set(stderr.split('\n').sort())).toEqual(
    new Set(
      [
        '- Deploying functions...',
        '- Deploying indexes...',
        '- Deploying roles...',
        '- Deploying schemas...',
        'ℹ No functions to deploy',
        'ℹ No indexes to deploy',
        'ℹ No roles to deploy',
        '✔ schemas have been deployed!',
      ].sort()
    )
  )

  expect(new Set(removeRetryMessages(stdout).split('\n'))).toEqual(
    new Set([
      '',
      `The following types are about to be deployed: \[ 'schemas', 'indexes', 'roles', 'functions' \]`,
      `schemas: Schema imported successfully.`,
      `Use the following HTTP header to connect to the FaunaDB GraphQL API:`,
      expect.stringMatching(/{ "Authorization": "Bearer [\S^"]+" } /),
      `All done! All deployments have been successful 🦆`,
    ])
  )

  expect(exitCode).toBe(0)

  expect(await amountOfRolesCreated()).toBe(0)
  expect(await amountOfFunctionsCreated()).toBe(0)
  expect(await amountOfCollectionsCreated()).toBe(1)
}, 240000)

test(`complete all 'deploy' operations for the 'modularized' example`, async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/modularized`, import.meta.url)))

  const { stdout, stderr, exitCode } = execaSync('node', ['../../cli.js', 'deploy'], {
    env: { DEBUG: '', FORCE_COLOR: 0, NODE_OPTIONS: '--no-warnings' },
    cwd,
  })

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(new Set(stderr.split('\n').sort())).toEqual(
    new Set(
      [
        '- Deploying functions...',
        '- Deploying indexes...',
        '- Deploying roles...',
        '- Deploying schemas...',
        'ℹ No indexes to deploy',
        'ℹ No roles to deploy',
        '✔ functions have been deployed!',
        '✔ schemas have been deployed!',
      ].sort()
    )
  )

  expect(new Set(removeRetryMessages(stdout).split('\n'))).toEqual(
    new Set([
      `The following types are about to be deployed: \[ 'schemas', 'indexes', 'roles', 'functions' \]`,
      `schemas: Schema imported successfully.`,
      `Use the following HTTP header to connect to the FaunaDB GraphQL API:`,
      expect.stringMatching(/{ "Authorization": "Bearer [\S^"]+" } /),
      '',
      `functions: [ 'sayHello' ] `,
      `All done! All deployments have been successful 🦆`,
    ])
  )

  expect(exitCode).toBe(0)

  expect(await amountOfRolesCreated()).toBe(0)
  expect(await amountOfFunctionsCreated()).toBe(1)
  expect(await amountOfCollectionsCreated()).toBe(2)
}, 240000)

test(`complete all 'deploy' operations for the 'with-UDF' example`, async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/with-UDF`, import.meta.url)))

  const { stdout, stderr, exitCode } = execaSync('node', ['../../cli.js', 'deploy'], {
    env: { DEBUG: '', FORCE_COLOR: 0, NODE_OPTIONS: '--no-warnings' },
    cwd,
  })

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(new Set(stderr.split('\n').sort())).toEqual(
    new Set(
      [
        '- Deploying functions...',
        '- Deploying indexes...',
        '- Deploying roles...',
        '- Deploying schemas...',
        'ℹ No indexes to deploy',
        '✔ functions have been deployed!',
        '✔ roles have been deployed!',
        '✔ schemas have been deployed!',
      ].sort()
    )
  )

  expect(new Set(removeRetryMessages(stdout).split('\n'))).toEqual(
    new Set([
      '',
      `The following types are about to be deployed: \[ 'schemas', 'indexes', 'roles', 'functions' \]`,
      `schemas: Schema imported successfully.`,
      `Use the following HTTP header to connect to the FaunaDB GraphQL API:`,
      expect.stringMatching(/{ "Authorization": "Bearer [\S^"]+" } /),
      "functions: [ 'sayHello', 'sayHi' ] ",
      "roles: [ 'publicAccess' ] ",
      `All done! All deployments have been successful 🦆`,
    ])
  )

  expect(exitCode).toBe(0)

  expect(await amountOfRolesCreated()).toBe(1)
  expect(await amountOfFunctionsCreated()).toBe(2)
  expect(await amountOfCollectionsCreated()).toBe(0)
}, 240000)
