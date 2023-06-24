import fs from 'fs/promises'
import _debug from 'debug'
import { execaSync } from 'execa'
import { fileURLToPath } from 'url'
import path from 'path'
import { temporaryFile, temporaryDirectory } from 'tempy'
import { findBin } from 'brainyduck/utils'
import {
  setupEnvironment,
  amountOfCollectionsCreated,
  listFiles,
  removeRetryMessages,
  load,
  reset,
  clone,
} from '../testUtils.js'

const debug = _debug('brainyduck:test:build')
const originalCache = fileURLToPath(new URL(`../../.cache`, import.meta.url))
setupEnvironment(`build`)

beforeAll(() =>
  fs.rm(originalCache, {
    recursive: true,
    force: true,
  })
)

const resetBuild = async (cwd) => {
  await fs.rm(path.join(cwd, 'build'), {
    recursive: true,
    force: true,
  })

  reset('documents')
}

const exportIt = async (cwd, callback) => {
  const destination = temporaryDirectory()
  debug(`Packing directory ${cwd} into ${destination}`)

  const { stdout, stderr, exitCode } = execaSync('node', ['../../cli.js', 'export', destination], {
    env: { DEBUG: 'brainyduck:*', FAUNA_SECRET: undefined },
    cwd,
  })

  debug(`Packing has finished with exit code ${exitCode}`)

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(
    expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
  )

  expect(removeRetryMessages(stdout)).toEqual(`The package has been saved at ${destination}`)

  debug(`The Package is valid`)
  expect(listFiles(destination)).toEqual(
    [
      'package.json',
      'sdk.d.ts',
      'sdk.mjs',
      'sdk.mjs.map',
      'sdk.cjs',
      'sdk.cjs.map',
      'sdk.ts',
      'tsconfig.json',
    ].sort()
  )

  execaSync(`npm`, ['i'], {
    cwd: destination,
  })

  const sdk = await import(destination)
  debug('Loaded the sdk:', sdk)

  await callback(sdk)

  expect(exitCode).toBe(0)
}

const packIt = async (cwd) => {
  debug(`Packing directory ${cwd}`)
  const packName = 'brainyduck-sdk-1.0.0.tgz'

  const { stdout, stderr, exitCode } = execaSync('node', ['../../cli.js', 'pack'], {
    env: { DEBUG: 'brainyduck:*', FAUNA_SECRET: undefined },
    cwd,
  })

  debug(`Packing has finished with exit code ${exitCode}`)

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(
    expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
  )

  expect(removeRetryMessages(stdout)).toEqual(
    `The package has been compressed and saved at ${path.join(cwd, packName)}`
  )

  debug(`The Package is valid`)
  expect(listFiles(cwd)).toEqual(expect.arrayContaining([packName]))

  expect(exitCode).toBe(0)
}

test('build an sdk for basic schema and non-standard cache', async () => {
  const root = clone()
  const cache = path.join(root, '.cache')
  const cwd = path.join(root, 'examples/basic')
  const outputCheck = (await import(`../fixtures/basic.output.js`)).default
  const tsconfig = temporaryFile({ name: 'tsconfig.json' })
  await fs.writeFile(tsconfig, JSON.stringify({ compilerOptions: { moduleResolution: 'Node' } }))

  debug(`Using temporary directory ${cwd}`)

  const { stdout, stderr, exitCode } = execaSync(
    'node',
    ['../../cli.js', 'build', 'Schema.graphql'],
    {
      env: { DEBUG: 'brainyduck:*', FAUNA_SECRET: undefined },
      cwd,
    }
  )

  debug(`Build of 'basic' has finished with exit code ${exitCode}`)

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(
    expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
  )

  expect(removeRetryMessages(stdout)).toEqual(
    `The sdk has been saved at ${path.join(cache, 'sdk.ts')}`
  )

  expect(await fs.readFile(path.join(cache, 'sdk.ts'), { encoding: 'utf8' })).toMatchSnapshot()
  debug(`The SDK is valid`)

  expect(listFiles(originalCache)).toEqual([].sort())
  expect(listFiles(cache)).toEqual(
    [
      'sdk.d.ts',
      'sdk.mjs',
      'sdk.mjs.map',
      'sdk.cjs',
      'sdk.cjs.map',
      'sdk.ts',
      'tsconfig.json',
    ].sort()
  )

  expect(exitCode).toBe(0)
  expect(await amountOfCollectionsCreated()).toBe(0)

  execaSync('node', ['../../cli.js', 'deploy'], {
    env: {
      DEBUG: '',
      FAUNA_SECRET: load('FAUNA_SECRET'),
      FORCE_COLOR: 0,
      NODE_OPTIONS: '--no-warnings',
    },
    cwd,
  })

  expect(await amountOfCollectionsCreated()).toBe(1)

  await exportIt(cwd, (sdk) => {
    expect(Object.keys(sdk)).toEqual([
      'AllUsersDocument',
      'CreateUserDocument',
      'DeleteUserDocument',
      'FindUserByIdDocument',
      'PartialUpdateUserDocument',
      'UpdateUserDocument',
      'brainyduck',
      'default',
      'getSdk',
    ])
  })

  await packIt(cwd)

  // ts-node tests
  outputCheck(
    execaSync(findBin('ts-node', './tests'), ['index.ts'], {
      env: { FAUNA_SECRET: load('FAUNA_SECRET') },
      cwd,
    }).stdout,
    'ts-node'
  )

  // tsc tests
  await resetBuild(cwd)

  expect(() =>
    // When we use a non-standard cache we can't build in strict mode
    execaSync(findBin('tsc', './tests'), ['index.ts', '--declaration', '--outDir', './build'], {
      env: {},
      stdio: ['ignore', process.stdout, process.stderr],
      cwd,
    })
  ).not.toThrow()

  outputCheck(
    execaSync('node', ['./build/index.js'], {
      env: { FAUNA_SECRET: load('FAUNA_SECRET') },
      cwd,
    }).stdout,
    'tsc'
  )

  // tsup tests (ESM)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('tsup', './tests'),
      [
        'index.ts',
        '--dts',
        '--out-dir',
        './build',
        '--format',
        'esm',
        '--no-config',
        '--tsconfig',
        tsconfig,
      ],
      {
        env: {},
        stdio: ['ignore', process.stdout, process.stderr],
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck(
    execaSync('node', ['./build/index.mjs'], {
      env: { FAUNA_SECRET: load('FAUNA_SECRET') },
      cwd,
    }).stdout,
    'tsup (ESM)'
  )

  // tsup tests (CJS)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('tsup', './tests'),
      [
        'index.ts',
        '--dts',
        '--out-dir',
        './build',
        '--format',
        'cjs',
        '--no-config',
        '--tsconfig',
        tsconfig,
      ],
      {
        env: {},
        stdio: ['ignore', process.stdout, process.stderr],
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck(
    execaSync('node', ['./build/index.js'], {
      env: { FAUNA_SECRET: load('FAUNA_SECRET') },
      cwd,
    }).stdout,
    'tsup (CJS)'
  )

  // esbuild tests (ESM)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('esbuild', './tests'),
      [
        '--sourcemap',
        '--outdir=./build',
        '--format=esm',
        `--tsconfig=${tsconfig}`,
        '--out-extension:.js=.mjs',
        'index.ts',
      ],
      {
        env: {},
        stdio: ['ignore', process.stdout, process.stderr],
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck(
    execaSync('node', ['./build/index.mjs'], {
      env: { FAUNA_SECRET: load('FAUNA_SECRET') },
      cwd,
    }).stdout,
    'esbuild (ESM)'
  )

  // esbuild tests (CJS)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('esbuild', './tests'),
      ['--sourcemap', '--outdir=./build', '--format=cjs', `--tsconfig=${tsconfig}`, 'index.ts'],
      {
        env: {},
        stdio: ['ignore', process.stdout, process.stderr],
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck(
    execaSync('node', ['./build/index.js'], {
      env: { FAUNA_SECRET: load('FAUNA_SECRET') },
      cwd,
    }).stdout,
    'esbuild (CJS)'
  )
}, 240000)

test(`build an sdk for the 'modularized' example`, async () => {
  const root = clone()
  const cache = path.join(root, '.cache')
  const cwd = path.join(root, 'examples/modularized')
  const outputCheck = (await import(`../fixtures/modularized.output.js`)).default

  debug(`Using temporary directory ${cwd}`)

  const { stdout, stderr, exitCode } = execaSync('node', ['../../cli.js', 'build'], {
    env: { DEBUG: 'brainyduck:*', FAUNA_SECRET: undefined },
    cwd,
  })

  debug(`Build of 'modularized' has finished with exit code ${exitCode}`)

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(
    expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
  )

  expect(removeRetryMessages(stdout)).toEqual(
    `The sdk has been saved at ${path.join(cache, 'sdk.ts')}`
  )

  expect(await fs.readFile(path.join(cache, 'sdk.ts'), { encoding: 'utf8' })).toMatchSnapshot()
  debug(`The SDK is valid`)

  expect(listFiles(originalCache)).toEqual([].sort())
  expect(listFiles(cache)).toEqual(
    [
      'sdk.d.ts',
      'sdk.mjs',
      'sdk.mjs.map',
      'sdk.cjs',
      'sdk.cjs.map',
      'sdk.ts',
      'tsconfig.json',
    ].sort()
  )

  expect(exitCode).toBe(0)
  expect(await amountOfCollectionsCreated()).toBe(0)

  execaSync('node', ['../../cli.js', 'deploy'], {
    env: {
      DEBUG: '',
      FAUNA_SECRET: load('FAUNA_SECRET'),
      FORCE_COLOR: 0,
      NODE_OPTIONS: '--no-warnings',
    },
    cwd,
  })

  expect(await amountOfCollectionsCreated()).toBe(2)

  await exportIt(cwd, (sdk) =>
    expect(Object.keys(sdk)).toEqual([
      'AllPostsDocument',
      'CreatePostDocument',
      'CreateUserDocument',
      'DeletePostDocument',
      'DeleteUserDocument',
      'FindPostByIdDocument',
      'FindUserByIdDocument',
      'PartialUpdatePostDocument',
      'PartialUpdateUserDocument',
      'SayHelloDocument',
      'UpdatePostDocument',
      'UpdateUserDocument',
      'brainyduck',
      'default',
      'getSdk',
    ])
  )

  await packIt(cwd)

  // ts-node tests
  outputCheck(
    execaSync(`node`, [`--loader`, `ts-node/esm`, 'index.ts'], {
      env: {
        FAUNA_SECRET: load('FAUNA_SECRET'),
      },
      cwd,
    }).stdout,
    'ts-node'
  )

  // tsc tests
  await resetBuild(cwd)

  expect(() =>
    execaSync(findBin('tsc', './tests'), ['--declaration', '--strict'], {
      env: {},
      stdio: ['ignore', process.stdout, process.stderr],
      cwd,
    })
  ).not.toThrow()

  outputCheck(
    execaSync('node', ['./build/index.js'], {
      env: {
        FAUNA_SECRET: load('FAUNA_SECRET'),
      },
      cwd,
    }).stdout,
    'tsc'
  )

  // tsup tests (ESM)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('tsup', './tests'),
      ['index.ts', '--dts', '--out-dir', './build', '--format', 'esm', '--no-config'],
      {
        env: {},
        stdio: ['ignore', process.stdout, process.stderr],
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck(
    execaSync('node', ['./build/index.js'], {
      env: {
        FAUNA_SECRET: load('FAUNA_SECRET'),
      },
      cwd,
    }).stdout,
    'tsup (ESM)'
  )

  // tsup tests (CJS)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('tsup', './tests'),
      ['index.ts', '--dts', '--out-dir', './build', '--format', 'cjs', '--no-config'],
      {
        env: {},
        stdio: ['ignore', process.stdout, process.stderr],
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck(
    execaSync('node', ['./build/index.cjs'], {
      env: {
        FAUNA_SECRET: load('FAUNA_SECRET'),
      },
      cwd,
    }).stdout,
    'tsup (CJS)'
  )

  // esbuild tests (ESM)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('esbuild', './tests'),
      ['--sourcemap', '--outdir=./build', '--format=esm', '--target=es6', 'index.ts'],
      {
        env: {},
        stdio: ['ignore', process.stdout, process.stderr],
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck(
    execaSync('node', ['./build/index.js'], {
      env: {
        FAUNA_SECRET: load('FAUNA_SECRET'),
      },
      cwd,
    }).stdout,
    'esbuild (ESM)'
  )

  // esbuild tests (CJS)
  await resetBuild(cwd)

  expect(() =>
    execaSync(
      findBin('esbuild', './tests'),
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
        stdio: ['ignore', process.stdout, process.stderr],
        cwd,
      }
    )
  ).not.toThrow()

  outputCheck(
    execaSync('node', ['./build/index.cjs'], {
      env: {
        FAUNA_SECRET: load('FAUNA_SECRET'),
      },
      cwd,
    }).stdout,
    'esbuild (CJS)'
  )
}, 240000)
