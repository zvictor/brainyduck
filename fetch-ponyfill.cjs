if (!globalThis.fetch) {
  return (exports = require('node-fetch'))
}

Object.defineProperty(exports, '__esModule', { value: true })

module.exports = globalThis.fetch
module.exports.Headers = globalThis.Headers
module.exports.Request = globalThis.Request
module.exports.Response = globalThis.Response
