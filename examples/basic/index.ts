import faugra from './faugra.sdk'
const { log } = console

const sdk = faugra()

async function main() {
  log(await sdk.sayHello({ name: 'dimension C-137' }))

  log(await sdk.createUser({ username: 'rick-sanchez' }))
  log(await sdk.createUser({ username: 'morty-smith' }))

  const { allUsers } = await sdk.allUsers()

  for (const user of allUsers.data) {
    log(user)
  }
}

main()

// Expected output of this script:

// { sayHello: 'Hello dimension C-137' }
// { createUser: { _id: '262820989366174226' } }
// { createUser: { _id: '262820990060331538' } }
// { username: 'rick-sanchez' }
// { username: 'morty-smith' }
