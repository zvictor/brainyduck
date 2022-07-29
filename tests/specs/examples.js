import fs from 'fs/promises'
import path from 'path'
import _debug from 'debug'
import { resolve } from 'path'
import { execaSync } from 'execa'
import { fileURLToPath } from 'url'
import { temporaryDirectory } from 'tempy'
import { setupEnvironment, load, clone } from '../testUtils.js'

const debug = _debug('brainyduck:test:examples')

setupEnvironment(`examples`)

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
    const root = clone()
    const cwd = path.join(root, `examples`, name)
    const outputCheck = (await import(`../fixtures/${name}.output.js`)).default

    debug(`Using temporary directory ${cwd}`)

    const { scripts } = JSON.parse(await fs.readFile(path.join(cwd, 'package.json')))

    if (scripts.build) {
      const build = execaSync('npm', ['run', '--silent', 'build'], {
        env: { DEBUG: 'brainyduck:*' },
        cwd,
      })

      debug(`Build of '${name}' has finished with exit code ${build.exitCode}`)

      expect(build.stderr).toEqual(expect.not.stringMatching(/error/i))
      expect(build.stdout).toEqual(
        expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
      )
      expect(build.exitCode).toBe(0)
      debug(`Build of '${name}' has completed successfully`)
    }

    if (scripts.deploy) {
      const deploy = execaSync('npm', ['run', '--silent', 'deploy'], {
        env: { DEBUG: 'brainyduck:*', FAUNA_SECRET: load('FAUNA_SECRET') },
        cwd,
      })

      expect(deploy.stderr).toEqual(expect.not.stringMatching(/error/i))
      expect(deploy.stdout).toEqual(
        expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
      )
      expect(deploy.exitCode).toBe(0)
      debug(`Deployment of '${name}' has completed successfully`)
    }

    if (scripts.dev) {
      const dev = execaSync('npm', ['run', '--silent', 'dev', '--', '--no-watch'], {
        env: { DEBUG: 'brainyduck:*', FAUNA_SECRET: load('FAUNA_SECRET') },
        cwd,
      })

      expect(dev.stderr).toEqual(expect.not.stringMatching(/error/i))
      expect(dev.stdout).toEqual(
        expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
      )
      expect(dev.exitCode).toBe(0)
      debug(`Dev preparation of '${name}' has completed successfully`)
    }

    const run = execaSync('npm', ['run', '--silent', 'start'], {
      env: {
        DEBUG: 'brainyduck:*',
        FAUNA_SECRET: load('FAUNA_SECRET'),
        TS_NODE_TRANSPILE_ONLY: 'true',
      },
      cwd,
    })

    expect(run.stderr).toEqual(expect.not.stringMatching(/error/i))
    expect(run.stdout).toEqual(
      expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
    )
    expect(run.exitCode).toBe(0)

    outputCheck(run.stdout, 'npm run start')
  }, 240000)
}
