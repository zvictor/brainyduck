import AccountContainer from '|lib/accountContainer'

const askCredentials = () => {
  const email = prompt('Please enter your email')
  const password = prompt('Please enter your password')

  if (!email || !password) {
    throw new Error('invalid value')
  }

  return { email, password }
}

const Page = () => {
  const { user, loading, signup, login, logout } = AccountContainer.useContainer()

  if (loading) {
    return 'loading...'
  }

  if (!user) {
    return (
      <>
        <button onClick={() => signup(askCredentials())}>Signup</button>
        <button onClick={() => login(askCredentials())}>Login</button>
      </>
    )
  }

  return (
    <>
      <p>User: {JSON.stringify(user)}</p>
      <button onClick={() => logout()}>Logout</button>
    </>
  )
}

Page.displayName = 'ProfilePage'
export default Page
