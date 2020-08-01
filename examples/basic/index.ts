import 'cross-fetch/polyfill'
import faugra from './faugra.sdk'
const { log } = console

const sdk = faugra()
const random = () => Math.random().toString(36).substring(7)

async function main() {
  log(await sdk.createUser({ username: `rick-sanchez-${random()}` }))
  log(await sdk.createUser({ username: `morty-smith-${random()}` }))

  const { allUsers } = await sdk.allUsers()

  for (const user of allUsers.data) {
    log(user)
  }
}

main()

// Expected output of this script:

// { createUser: { _id: 'xxx' } }
// { createUser: { _id: 'xxx' } }
// { username: 'rick-sanchez-xxx' }
// { username: 'morty-smith-xxx' }
