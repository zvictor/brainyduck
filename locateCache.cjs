const path = require('path')

module.exports = (file = '') => path.join(__dirname, `.cache/`, file)
