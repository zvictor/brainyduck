const faugra = require('./faugra.sdk').default()
const { log } = console

async function main() {
  log(await faugra.sayHello({ name: 'dimension C-137' }))

  log(await faugra.createUser({ username: 'rick-sanchez' }))
  log(await faugra.createUser({ username: 'morty-smith' }))

  const { allUsers } = await faugra.allUsers()

  for (const user of allUsers.data) {
    log(user)
  }
}

main()
