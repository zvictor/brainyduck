const globby = require('globby')

const patternMatch = (pattern) =>
  globby(pattern, {
    cwd: process.cwd(),
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
}
