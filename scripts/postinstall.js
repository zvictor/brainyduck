#!/usr/bin/env node
// https://npm.community/t/how-can-i-publish-symlink/5599

const fs = require('fs')
const findCacheDir = require('find-cache-dir')

const cache = findCacheDir({ name: 'faugra', cwd: '../..', thunk: true })('sdk.d.ts')

try {
  fs.unlinkSync('index.d.ts')
} catch (e) {}

fs.symlinkSync(cache, 'index.d.ts', 'file')

process.exit(0)
