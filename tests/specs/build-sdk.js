import fs from 'fs/promises'
import _debug from 'debug'
import { execaSync } from 'execa'
import { fileURLToPath } from 'url'
import path, { resolve } from 'path'
import { temporaryDirectory, temporaryFile } from 'tempy'
import reset from '../../commands/reset'
import { findBin } from '../../utils'
import {
  setupEnvironment,
  amountOfCollectionsCreated,
  listFiles,
  removeRetryMessages,
} from '../testUtils.js'

const debug = _debug('faugra:test:build-sdk')
const cache = { DEFAULT: fileURLToPath(new URL(`../../.cache`, import.meta.url)) }
setupEnvironment(`build-sdk`)

beforeEach(() => {
  cache.TEST = temporaryDirectory()
  debug(`Using cache directory ${cache.TEST}`)

  return Promise.all([
    fs.rm(cache.DEFAULT, { recursive: true, force: true }),
    reset({ schemas: true, collections: true }),
  ])
}, 240000)

const resetBuild = (cwd, ...extra) =>
  Promise.all([
    reset({ documents: true }),
    fs.rm(path.join(cwd, 'build'), {
      recursive: true,
      force: true,
    }),
    ...extra,
  ])

const outputCheck = {
  basic: (results, name) => {
    console.log(`Basic example ${name ? `- ${name} ` : ''}run:\n`, results)

    const parsedResults = JSON.parse(
      `[${results
        .replaceAll(`'`, `"`)
        .replace(/([\w]+):/gm, `"$1":`)
        .replace(/}[\s]*{/gm, '},{')}]`
    )

    expect(parsedResults.length).toBe(4)

    expect(parsedResults[0]).toEqual({
      createUser: {
        _id: expect.any(String),
        _ts: expect.any(Number),
        username: expect.stringContaining('rick-sanchez-'),
      },
    })

    expect(parsedResults[1]).toEqual({
      createUser: {
        _id: expect.any(String),
        _ts: expect.any(Number),
        username: expect.stringContaining('morty-smith-'),
      },
    })
    expect(parsedResults[2]).toEqual({
      _id: expect.any(String),
      _ts: expect.any(Number),
      username: expect.stringContaining('rick-sanchez-'),
    })
    expect(parsedResults[3]).toEqual({
      _id: expect.any(String),
      _ts: expect.any(Number),
      username: expect.stringContaining('morty-smith-'),
    })
  },
  modularized: (results, name) => {
    console.log(`Modularized example ${name ? `- ${name} ` : ''}run:\n`, results)

    const parsedResults = JSON.parse(
      results
        .split('\n')
        .slice(1)
        .join('\n')
        .replaceAll(`'`, `"`)
        .replace(/([\w]+):/gm, `"$1":`)
        .replace(/}[\s]*{/gm, '},{')
    )

    expect(parsedResults).toEqual({
      findPostByID: {
        author: {
          _id: expect.any(String),
          _ts: expect.any(Number),
          name: 'Whatever Name',
        },
        _id: expect.any(String),
        _ts: expect.any(Number),
        content: 'some post content',
        title: 'a post title',
      },
    })
  },
}

test('build an sdk for basic schema and non-standard cache', async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/basic`, import.meta.url)))
  const tsconfig = temporaryFile({ name: 'tsconfig.json' })

  const { stdout, stderr, exitCode } = execaSync(
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
    ['sdk.d.ts', 'sdk.d.ts.map', 'sdk.cjs', 'sdk.cjs.map', 'sdk.ts', 'tsconfig.json'].sort()
  )

  expect(exitCode).toBe(0)
  expect(await amountOfCollectionsCreated()).toBe(1)

  await fs.writeFile(tsconfig, JSON.stringify({ compilerOptions: { moduleResolution: 'Node' } }))

  // ts-node tests
  outputCheck.basic(
    execaSync(findBin('ts-node'), ['index.ts'], {
      env: { FAUGRA_CACHE: cache.TEST },
      cwd,
    }).stdout,
    'ts-node'
  )

  // tsc tests
  await resetBuild(cwd)

  expect(() =>
    // When we use a non-standard cache we can't build in strict mode
    execaSync(findBin('tsc'), ['index.ts', '--declaration', '--outDir', './build'], {
      env: { FAUGRA_CACHE: cache.TEST },
      cwd,
    })
  ).not.toThrow()

  outputCheck.basic(
    execaSync('node', ['./build/index.js'], {
      env: { FAUGRA_CACHE: cache.TEST },
      cwd,
    }).stdout,
    'tsc'
  )

  // tsup tests (ESM)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('tsup'),
      ['index.ts', '--dts', '--out-dir', './build', '--format', 'esm', '--tsconfig', tsconfig],
      {
        env: { FAUGRA_CACHE: cache.TEST },
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck.basic(
    execaSync('node', ['./build/index.mjs'], {
      env: { FAUGRA_CACHE: cache.TEST },
      cwd,
    }).stdout,
    'tsup (ESM)'
  )

  // tsup tests (CJS)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('tsup'),
      ['index.ts', '--dts', '--out-dir', './build', '--format', 'cjs', '--tsconfig', tsconfig],
      {
        env: { FAUGRA_CACHE: cache.TEST },
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck.basic(
    execaSync('node', ['./build/index.js'], {
      env: { FAUGRA_CACHE: cache.TEST },
      cwd,
    }).stdout,
    'tsup (CJS)'
  )

  // esbuild tests (ESM)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('esbuild'),
      [
        '--sourcemap',
        '--outdir=./build',
        '--format=esm',
        `--tsconfig=${tsconfig}`,
        '--out-extension:.js=.mjs',
        'index.ts',
      ],
      {
        env: { FAUGRA_CACHE: cache.TEST },
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck.basic(
    execaSync('node', ['./build/index.mjs'], {
      env: { FAUGRA_CACHE: cache.TEST },
      cwd,
    }).stdout,
    'esbuild (ESM)'
  )

  // esbuild tests (CJS)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('esbuild'),
      ['--sourcemap', '--outdir=./build', '--format=cjs', `--tsconfig=${tsconfig}`, 'index.ts'],
      {
        env: { FAUGRA_CACHE: cache.TEST },
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck.basic(
    execaSync('node', ['./build/index.js'], {
      env: { FAUGRA_CACHE: cache.TEST },
      cwd,
    }).stdout,
    'esbuild (CJS)'
  )
}, 240000)

test(`build an sdk for the 'modularized' example, with standard cache`, async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/modularized`, import.meta.url)))

  const { stdout, stderr, exitCode } = execaSync('node', ['../../cli.js', 'build-sdk'], {
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
    ['sdk.d.ts', 'sdk.d.ts.map', 'sdk.cjs', 'sdk.cjs.map', 'sdk.ts', 'tsconfig.json'].sort()
  )

  expect(exitCode).toBe(0)
  expect(await amountOfCollectionsCreated()).toBe(2)

  // ts-node tests
  outputCheck.modularized(
    execaSync(`node`, [`--loader`, `ts-node/esm`, 'index.ts'], {
      env: {},
      cwd,
    }).stdout,
    'ts-node'
  )

  // tsc tests
  await resetBuild(cwd)

  expect(() =>
    execaSync(findBin('tsc'), ['--declaration', '--strict'], {
      env: {},
      cwd,
    })
  ).not.toThrow()

  outputCheck.modularized(
    execaSync('node', ['./build/index.js'], {
      env: {},
      cwd,
    }).stdout,
    'tsc'
  )

  // tsup tests (ESM)
  await resetBuild(cwd)

  expect(() =>
    execaSync(findBin('tsup'), ['index.ts', '--dts', '--out-dir', './build', '--format', 'esm'], {
      env: {},
      cwd,
    })
  ).not.toThrow()

  outputCheck.modularized(
    execaSync('node', ['./build/index.js'], {
      env: {},
      cwd,
    }).stdout,
    'tsup (ESM)'
  )

  // tsup tests (CJS)
  await resetBuild(cwd)

  expect(() =>
    execaSync(findBin('tsup'), ['index.ts', '--dts', '--out-dir', './build', '--format', 'cjs'], {
      env: {},
      cwd,
    })
  ).not.toThrow()

  outputCheck.modularized(
    execaSync('node', ['./build/index.cjs'], {
      env: {},
      cwd,
    }).stdout,
    'tsup (CJS)'
  )

  // esbuild tests (ESM)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('esbuild'),
      ['--sourcemap', '--outdir=./build', '--format=esm', '--target=es6', 'index.ts'],
      {
        env: {},
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck.modularized(
    execaSync('node', ['./build/index.js'], {
      env: {},
      cwd,
    }).stdout,
    'esbuild (ESM)'
  )

  // esbuild tests (CJS)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('esbuild'),
      [
        '--sourcemap',
        '--outdir=./build',
        '--format=cjs',
        '--target=es6',
        '--out-extension:.js=.cjs',
        'index.ts',
      ],
      {
        env: {},
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck.modularized(
    execaSync('node', ['./build/index.cjs'], {
      env: {},
      cwd,
    }).stdout,
    'esbuild (CJS)'
  )
}, 240000)
