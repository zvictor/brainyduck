import 'cross-fetch/polyfill'
import faugra from './faugra.sdk'

faugra().sayHello({ name: 'dimension C-137' }).then(console.log)

// Expected output of this script:

// { sayHello: 'Hello dimension C-137' }
