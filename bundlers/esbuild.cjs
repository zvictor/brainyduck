module.exports = (options = {}) => ({
  name: 'brainyduck-resolve',
  setup(build) {
    let locateCache = require('brainyduck/cache')
    const sdk = build.initialOptions.format === 'esm' ? 'sdk.mjs' : 'sdk.cjs'

    build.onResolve({ filter: /^brainyduck$/ }, () => {
      return {
        path: options.cache ? require('path').join(options.cache, sdk) : locateCache(sdk),
      }
    })
  },
})
