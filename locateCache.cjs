const path = require('path')

module.exports = (file = '') =>
  process.env.FAUGRA_CACHE
    ? path.join(process.env.FAUGRA_CACHE, file)
    : path.join(__dirname, `.cache/`, file)
