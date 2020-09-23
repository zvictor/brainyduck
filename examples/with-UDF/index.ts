import 'cross-fetch/polyfill'
import faugra from './faugra.sdk'

faugra().sayHi({ name: 'dimension C-137' }).then(console.log)
faugra().sayHello({ name: 'dimension C-137' }).then(console.log)

// Expected output of this script:

// { sayHello: 'Hi dimension C-137' }
// { sayHello: 'Hello dimension C-137' }
