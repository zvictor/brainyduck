import faugra from 'faugra'

faugra().sayHi({ name: 'dimension C-137' }).then(console.log)
faugra().sayHello({ name: 'dimension C-137' }).then(console.log)

// Expected output of this script:

// { sayHi: 'Hi dimension C-137' }
// { sayHello: 'Hello dimension C-137' }
