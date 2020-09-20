const globby = require('globby')

const ignored = process.env.FAUGRA_IGNORE
  ? process.env.FAUGRA_IGNORE.split(',')
  : ['**/node_modules/**', '**/.git/**']

const patternMatch = (pattern) =>
  globby(pattern, {
    cwd: process.cwd(),
    ignore: ignored,
  })

const pipeData = new Promise((resolve, reject) => {
  const stdin = process.openStdin()
  let data = ''

  stdin.on('data', function (chunk) {
    data += chunk
  })

  stdin.on('error', function (e) {
    reject(e)
  })

  stdin.on('end', function () {
    resolve(data)
  })
})

module.exports = {
  patternMatch,
  pipeData,
  ignored,
}
