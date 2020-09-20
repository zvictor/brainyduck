#!/usr/bin/env node

const fs = require('fs')
const debug = require('debug')('faugra:generate-types')
const { codegen } = require('@graphql-codegen/core')
const { parse } = require('graphql')
const { pipeData } = require('../utils')
const push = require('./push-schema')
const pull = require('./pull-schema')

const config = {
  plugins: [
    // Each plugin should be an object
    {
      typescript: {}, // Here you can pass configuration to the plugin
    },
  ],
  pluginMap: {
    typescript: require('@graphql-codegen/typescript'),
  },
}

const generateTypes = (schema) =>
  codegen({
    ...config,
    schema: parse(schema),
  })

const main = async (inputData, outputPath) => {
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

if (require.main === module) {
  const [inputPath, outputPath] = process.argv.slice(2)

  main(inputPath === '-' ? pipeData() : inputPath, outputPath)
    .then((types) => {
      if (!outputPath) {
        console.log(types)
      }

      process.exit(0)
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

module.exports = main
