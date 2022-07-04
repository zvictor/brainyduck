module.exports = (options = {}) => ({
  name: 'faugra-resolve',
  setup(build) {
    let locateCache = require('faugra/cache')
    const sdk = build.initialOptions.format === 'esm' ? 'sdk.mjs' : 'sdk.cjs'

    build.onResolve({ filter: /^faugra$/ }, () => {
      return {
        path: options.cache ? require('path').join(options.cache, sdk) : locateCache(sdk),
      }
    })
  },
})
