const fs = require('fs')
const { locateCache } = require('./utils')

const filePath = locateCache('sdk.js')

if (!fs.existsSync(filePath)) {
  console.error(
    `Project is missing SDK! 🤷‍🐣\n\nPlease run 'npx faugra dev' (or 'npx faugra build-sdk') in your project diretory to get started. 💁🐥\n ↳ read more on https://github.com/zvictor/faugra/wiki/Missing-sdk\n`
  )

  throw new Error('SDK could not be found.')
}

if (require.main === module) {
  console.error(
    `You tried executing faugra in some unexpected and unsupported way! 🤷‍🍳\n\nPlease run 'npx faugra --help' in your project diretory to get started. 💁🥚\n ↳ or ask for help on https://github.com/zvictor/faugra/discussions\n`
  )

  throw new Error('Non executable file')
}

module.exports = require(filePath)
