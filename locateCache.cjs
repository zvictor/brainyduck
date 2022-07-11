const path = require('path')

module.exports = (file = '') =>
  process.env.BRAINYDUCK_CACHE
    ? path.join(process.env.BRAINYDUCK_CACHE, file)
    : path.join(__dirname, `.cache/`, file)
