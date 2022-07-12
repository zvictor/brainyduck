import path from 'path'
import { fileURLToPath } from 'url'
import { build } from 'esbuild'
import bundler from 'brainyduck/bundlers/esbuild'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

try {
  await build({
    plugins: [bundler()],
    bundle: true,
    sourcemap: true,
    platform: 'node',
    format: 'esm',
    target: 'es6',
    entryPoints: [path.join(__dirname, 'index.ts')],
    outdir: path.join(__dirname, 'build'),
    external: ['graphql-request', 'graphql-tag'],
  })
} catch {
  process.exitCode = 1
}
