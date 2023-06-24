const debug = require('debug')

if (!globalThis.fetch) {
  debug('brainyduck:fetch')(`Native fetch not found. Using node-fetch`)
  module.exports = require('node-fetch')
} else {
  debug('brainyduck:fetch')(`Using native fetch`)
  Object.defineProperty(exports, '__esModule', { value: true })

  module.exports = globalThis.fetch
  module.exports.Headers = globalThis.Headers
  module.exports.Request = globalThis.Request
  module.exports.Response = globalThis.Response
}
