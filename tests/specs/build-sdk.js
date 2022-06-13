import fs from 'fs/promises'
import path from 'path'
import execa from 'execa'
import tempy from 'tempy'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import reset from '../../commands/reset'
import { findBin } from '../../utils'
import {
  setupEnvironment,
  amountOfCollectionsCreated,
  listFiles,
  removeRetryMessages,
} from '../testUtils.js'

const cache = { DEFAULT: fileURLToPath(new URL(`../../.cache`, import.meta.url)) }
setupEnvironment(`build-sdk`)

beforeEach(() => {
  cache.TEST = tempy.directory()

  return Promise.all([
    fs.rm(cache.DEFAULT, { recursive: true, force: true }),
    reset({ schemas: true, collections: true }),
  ])
}, 240000)

test('build an sdk for a schema without imports and non-standard cache', async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/basic`, import.meta.url)))

  const { stdout, stderr, exitCode } = execa.sync(
    'node',
    ['../../cli.js', 'build-sdk', 'Schema.graphql'],
    { env: { DEBUG: 'faugra:*', FAUGRA_CACHE: cache.TEST }, cwd }
  )

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(
    expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
  )

  expect(removeRetryMessages(stdout)).toEqual(
    `The sdk has been saved at ${path.join(cache.TEST, 'sdk.ts')}`
  )

  // Uncomment to update fixtures.
  // await fs.writeFile(
  //   fileURLToPath(new URL(`../fixtures/basic.sdk.ts`, import.meta.url)),
  //   await fs.readFile(path.join(cache.TEST, 'sdk.ts'), { encoding: 'utf8' })
  // )
  expect(await fs.readFile(path.join(cache.TEST, 'sdk.ts'), { encoding: 'utf8' })).toEqual(
    await fs.readFile(fileURLToPath(new URL(`../fixtures/basic.sdk.ts`, import.meta.url)), {
      encoding: 'utf8',
    })
  )

  expect(listFiles(cache.DEFAULT)).toEqual([].sort())
  expect(listFiles(cache.TEST)).toEqual(
    ['sdk.d.ts', 'sdk.d.ts.map', 'sdk.js', 'sdk.js.map', 'sdk.ts', 'tsconfig.json'].sort()
  )

  expect(exitCode).toBe(0)
  expect(await amountOfCollectionsCreated()).toBe(1)

  expect(() =>
    // When we use a non-standard cache we can't build in strict mode
    execa.sync(findBin('tsc'), ['index.ts', '--noEmit', '--declaration'], {
      env: { FAUGRA_CACHE: cache.TEST },
      cwd,
    })
  ).not.toThrow()
}, 240000)

test(`build an sdk for the 'modularized' example, with standard cache`, async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/modularized`, import.meta.url)))

  const { stdout, stderr, exitCode } = execa.sync('node', ['../../cli.js', 'build-sdk'], {
    env: { DEBUG: 'faugra:*' },
    cwd,
  })

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(
    expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
  )

  expect(removeRetryMessages(stdout)).toEqual(
    `The sdk has been saved at ${path.join(cache.DEFAULT, 'sdk.ts')}`
  )

  // Uncomment to update fixtures.
  // await fs.writeFile(
  //   fileURLToPath(new URL(`../fixtures/modularized.sdk.ts`, import.meta.url)),
  //   await fs.readFile(path.join(cache.DEFAULT, 'sdk.ts'), { encoding: 'utf8' })
  // )
  expect(await fs.readFile(path.join(cache.DEFAULT, 'sdk.ts'), { encoding: 'utf8' })).toEqual(
    await fs.readFile(fileURLToPath(new URL(`../fixtures/modularized.sdk.ts`, import.meta.url)), {
      encoding: 'utf8',
    })
  )

  expect(listFiles(cache.TEST)).toEqual([].sort())
  expect(listFiles(cache.DEFAULT)).toEqual(
    ['sdk.d.ts', 'sdk.d.ts.map', 'sdk.js', 'sdk.js.map', 'sdk.ts', 'tsconfig.json'].sort()
  )

  expect(exitCode).toBe(0)
  expect(await amountOfCollectionsCreated()).toBe(2)

  expect(() =>
    execa.sync(findBin('tsc'), ['index.ts', '--noEmit', '--declaration', '--strict'], {
      cwd,
    })
  ).not.toThrow()
}, 240000)
