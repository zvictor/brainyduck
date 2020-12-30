import sdk from 'faugra'
import { NextApiResponse } from 'next'
import withSession, { ApiRequestWithSession } from '|lib/withSession'

type Method = keyof ReturnType<typeof sdk>

export default withSession(async (req: ApiRequestWithSession, res: NextApiResponse) => {
  try {
    const { method, args } = <{ method: Method; args: any }>await req.body

    if (!method) {
      throw new Error('Method and arguments must be provided.')
    }

    let secret = req.session.get('secret')

    if (!secret) {
      return res.status(401).json(new Error(`Unauthorized request from unregistered client`))
    }

    const response = await sdk({ secret })[method](args)
    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message || error })
  }
})
