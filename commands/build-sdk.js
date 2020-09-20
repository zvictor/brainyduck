#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const debug = require('debug')('faugra:build-sdk')
const { codegen } = require('@graphql-codegen/core')
const { parse } = require('graphql')
const { pipeData, patternMatch } = require('../utils')
const push = require('./push-schema')
const pull = require('./pull-schema')

const config = {
  filename: 'output.ts',
  plugins: [
    // Each plugin should be an object
    {
      typescript: {}, // Here you can pass configuration to the plugin
    },
    { ['typescript-operations']: {} },
    {
      ['typescript-graphql-request']: {},
    },
  ],
  pluginMap: {
    typescript: require('@graphql-codegen/typescript'),
    ['typescript-operations']: require('@graphql-codegen/typescript-operations'),
    ['typescript-graphql-request']: require('@graphql-codegen/typescript-graphql-request'),
  },
}

const generateSdk = async (schema, documentsPattern) => {
  debug(`Looking for documents matching '${documentsPattern}'`)

  const documents = (
    await patternMatch(
      Array.isArray(documentsPattern) ? documentsPattern : documentsPattern.split(',')
    )
  ).map((x) => ({
    location: x,
    document: parse(fs.readFileSync(path.resolve(x), 'utf8')),
  }))

  return await codegen({
    ...config,
    documents,
    schema: parse(schema),
  })
}

const main = async (schemaPattern, documentsPattern = '**/[a-z]*.(graphql|gql)', outputPath) => {
  await push(await schemaPattern)
  const schema = await pull()

  debug(`Generating TypeScript SDK`)
  const sdk = await generateSdk(schema, await documentsPattern)

  const ouput = `${sdk}

export default function main({
  secret = process.env.FAUGRA_SECRET,
  domain = process.env.FAUGRA_DOMAIN,
} = {}) {
  if (!secret) {
    throw new Error('FAUGRA_SECRET has not been defined.')
  }

  return getSdk(
    new GraphQLClient(domain || 'https://graphql.fauna.com/graphql', {
      headers: {
        authorization: \`Bearer \${secret || process.env.FAUGRA_SECRET}\`,
      },
    })
  )
}`

  if (outputPath) {
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(outputPath, ouput)
    debug(`The sdk were saved at '${outputPath}'`)
  }

  return ouput
}

if (require.main === module) {
  const [
    schemaPattern,
    documentsPattern,
    outputPath = path.resolve('./faugra.sdk.ts'),
  ] = process.argv.slice(2)

  main(
    schemaPattern === '-' ? pipeData() : schemaPattern,
    documentsPattern === '-' ? pipeData() : documentsPattern,
    outputPath
  )
    .then((sdk) => {
      if (!outputPath) {
        console.log(sdk)
      }

      process.exit(0)
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

module.exports = main
