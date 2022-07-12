import brainyduck from 'brainyduck'

brainyduck().sayHi({ name: 'dimension C-137' }).then(console.log)
brainyduck().sayHello({ name: 'dimension C-137' }).then(console.log)

// Expected output of this script:

// { sayHi: 'Hi dimension C-137' }
// { sayHello: 'Hello dimension C-137' }
