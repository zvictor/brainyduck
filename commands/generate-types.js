#!/usr/bin/env node

import fs from 'fs'
import _debug from 'debug'
import { parse } from 'graphql'
import { codegen } from '@graphql-codegen/core'
import { fileURLToPath } from 'url'
import * as typescriptPlugin from '@graphql-codegen/typescript'
import { pipeData } from '../utils.js'
import push from './deploy-schema.js'
import pull from './pull-schema.js'

const debug = _debug('faugra:generate-types')

const config = {
  plugins: [
    // Each plugin should be an object
    {
      typescript: {}, // Here you can pass configuration to the plugin
    },
  ],
  pluginMap: {
    typescript: typescriptPlugin,
  },
}

const generateTypes = (schema) =>
  codegen({
    ...config,
    schema: parse(schema),
  })

export default async function main(inputData, outputPath) {
  debug(`called with:`, { inputData, outputPath })
  debug(`schema needs to be pushed-and-pulled first`)
  await push(await inputData)
  const schema = await pull()

  debug(`Generating TypeScript types`)
  const types = await generateTypes(schema, outputPath)

  if (outputPath) {
    fs.writeFileSync(outputPath, types)
    debug(`The types were saved at '${outputPath}'`)
  }

  return types
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [inputPath, outputPath] = process.argv.slice(2)

  ;(async () => {
    const types = await main(inputPath === '-' ? pipeData() : inputPath, outputPath)
    if (!outputPath) {
      console.log(types)
    }
  })()
}
