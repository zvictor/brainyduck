import 'cross-fetch/polyfill'
import sdk from 'faugra'

const random = () => Math.random().toString(36).substring(7)

;(async () => {
  console.log(await sdk().createUser({ username: `rick-sanchez-${random()}` }))
  console.log(await sdk().createUser({ username: `morty-smith-${random()}` }))

  const { allUsers } = await sdk().allUsers()

  for (const user of allUsers.data) {
    console.log(user)
  }
})()

// Expected output of this script:

// { createUser: { _id: 'xyz' } }
// { createUser: { _id: 'xyz' } }

// { username: 'rick-sanchez-xyz' }
// { username: 'morty-smith-xyz' }
