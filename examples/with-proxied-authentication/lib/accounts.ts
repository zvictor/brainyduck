import proxy from '|lib/proxy'
import fetchJson from '|lib/fetchJson'

const prepareAction = (name: string) => (body: object) =>
  fetchJson(`/api/${name}`, { method: 'POST', body })

export const signup = prepareAction('signup')
export const login = prepareAction('login')
export const logout = prepareAction('logout')
export const user = () => proxy.whoAmI().then(({ whoAmI }) => whoAmI)
