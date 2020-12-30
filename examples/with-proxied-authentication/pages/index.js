import React from 'react'
import { proxy, useProxy, subscribe } from 'valtio'
import { user, signup, login, logout } from '|lib/accounts'

const askCredentials = () => {
  const email = prompt('Please enter your email')
  const password = prompt('Please enter your password')

  if (!email || !password) {
    throw new Error('invalid value')
  }

  return { email, password }
}

const state = proxy({ user: null })
const updateUser = () =>
  (state.user = user().catch((err) => {
    console.error(err)
    return null
  }))

subscribe(state, () => console.log('user has changed to', state.user))

if (typeof window !== 'undefined') {
  updateUser()
}

const Page = () => {
  const snapshot = useProxy(state)

  if (!snapshot.user) {
    return (
      <>
        <button onClick={() => signup(askCredentials()).then(updateUser)}>Signup</button>
        <button onClick={() => login(askCredentials()).then(updateUser)}>Login</button>
      </>
    )
  }

  return (
    <>
      <p>User: {JSON.stringify(snapshot.user)}</p>
      <button onClick={() => logout().then(updateUser)}>Logout</button>
    </>
  )
}

const Suspense = typeof window !== 'undefined' ? React.Suspense : React.Fragment

const App = () => (
  <Suspense fallback={<h1>loading...</h1>}>
    <Page />
  </Suspense>
)
export default App
