import sdk from 'brainyduck'
import fetchJson from './fetchJson'

const call = async (
  method: string | number | symbol,
  args: object
): Promise<ReturnType<typeof fetchJson>> => {
  if (typeof window === 'undefined') {
    console.error(`Failed attempt to call ${String(method)} with args:`, args)
    throw new Error(`A proxied call can only be made on the client side.`)
  }

  return await fetchJson('/api/proxy', {
    method: 'POST',
    body: { method, args },
  })
}

const proxy = new Proxy(
  {},
  {
    get(target, prop, receiver) {
      return (args: object) => call(prop, args)
    },
  }
) as ReturnType<typeof sdk>

export default proxy
