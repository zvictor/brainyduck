#!/usr/bin/env node
// https://npm.community/t/how-can-i-publish-symlink/5599

const fs = require('fs')
const { locateCache } = require('../utils')

let cache
// Todo: Find a way to detect installation context and kill the try/catch
try {
  // From within the package being installed, node consider one extra node_modules folder.
  // Instead of `my-package/node_modules/.cache/faugra/sdk.d.ts`,
  // you would get `my-package/node_modules/faugra/node_modules/.cache/faugra/sdk.d.ts`.
  //
  // Thus, `cwd: '../..'` is needed.
  cache = locateCache('sdk.d.ts', { cwd: '../..' })
} catch (err) {
  // In case you run `npm i` directly in faugra's directory, there will be no extra node_modules.
  // Thus, you should not change `cwd`
  cache = locateCache('sdk.d.ts')
}

try {
  fs.unlinkSync('index.d.ts')
} catch (e) {}

fs.symlinkSync(cache, 'index.d.ts', 'file')

process.exit(0)
