import fs from 'fs/promises'
import _debug from 'debug'
import { resolve } from 'path'
import { execaSync } from 'execa'
import { fileURLToPath } from 'url'
import { temporaryDirectory } from 'tempy'
import { setupEnvironment } from '../testUtils.js'

const debug = _debug('faugra:test:examples')

setupEnvironment(`examples`, { beforeEach: true })

// const examples = (
//   await fs.readdir(fileURLToPath(new URL(`../../examples`, import.meta.url)), {
//     encoding: 'utf-8',
//     withFileTypes: true,
//   })
// )
//   .filter((dirent) => dirent.isDirectory())
//   .map((dirent) => dirent.name)
// TODO: standardize the way examples are built and run, then test them all from here
const examples = ['basic', 'basic-esbuild-bundle', 'modularized', 'modularized-esbuild-bundle']

console.log(`Testing the following examples:`, examples)

for (const name of examples) {
  test(`build and run example '${name}'`, async () => {
    const cwd = resolve(fileURLToPath(new URL(`../../examples/${name}`, import.meta.url)))
    const outputCheck = (await import(`../fixtures/${name}.output.js`)).default
    const cache = temporaryDirectory()
    debug(`Using cache directory ${cache}`)

    const build = execaSync('npm', ['run', '--silent', 'build'], {
      env: { DEBUG: 'faugra:*', FAUGRA_CACHE: cache },
      cwd,
    })

    expect(build.stderr).toEqual(expect.not.stringMatching(/error/i))
    expect(build.stdout).toEqual(
      expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
    )
    expect(build.exitCode).toBe(0)

    const run = execaSync('npm', ['run', '--silent', 'start'], {
      env: { DEBUG: 'faugra:*', FAUGRA_CACHE: cache },
      cwd,
    })

    expect(run.stderr).toEqual(expect.not.stringMatching(/error/i))
    expect(run.stdout).toEqual(
      expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
    )
    expect(run.exitCode).toBe(0)

    outputCheck(run.stdout, 'npm run start')
  })
}
