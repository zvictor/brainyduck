import { useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'
import fetchJson from '|lib/fetchJson'

function useAccount() {
  const [user, setUser] = useState(null)
  useEffect(() => runAction('user')(), [])

  const updateUser = (promise) => {
    setUser(promise)
    promise.then((user) => setUser(user))
  }

  const runAction = (name) => (body) =>
    updateUser(fetchJson(`/api/${name}`, { method: 'POST', body }))

  return {
    user,
    signup: runAction('signup'),
    login: runAction('login'),
    logout: runAction('logout'),
    loading: Promise.resolve(user) == user,
  }
}

export default createContainer(useAccount)
