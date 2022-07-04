const debug = require('debug')

if (!globalThis.fetch) {
  debug('faugra:fetch')(`Native fetch not found. Using node-fetch`)
  return (module.exports = require('node-fetch'))
}

debug('faugra:fetch')(`Using native fetch`)
Object.defineProperty(exports, '__esModule', { value: true })

module.exports = globalThis.fetch
module.exports.Headers = globalThis.Headers
module.exports.Request = globalThis.Request
module.exports.Response = globalThis.Response
