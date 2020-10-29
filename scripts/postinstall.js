#!/usr/bin/env node
// https://npm.community/t/how-can-i-publish-symlink/5599

const fs = require('fs')
const { locateCache } = require('../utils')

try {
  fs.unlinkSync('index.d.ts')
} catch (e) {}

fs.symlinkSync(locateCache('sdk.d.ts'), 'index.d.ts', 'file')

process.exit(0)
