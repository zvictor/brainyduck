#!/usr/bin/env node
// https://npm.community/t/how-can-i-publish-symlink/5599

import fs from 'fs'
import { locateCache } from '../utils.js'

try {
  fs.unlinkSync('index.d.ts')
} catch (e) {}

fs.symlinkSync(locateCache('sdk.d.ts'), 'index.d.ts', 'file')

process.exit(0)
