import sdk from 'brainyduck'
import { NextApiResponse } from 'next'
import withSession, { ApiRequestWithSession } from '|lib/withSession'

export default withSession(async (req: ApiRequestWithSession, res: NextApiResponse) => {
  try {
    const { email, password } = await req.body

    if (!email || !password) {
      throw new Error('Email and password must be provided.')
    }

    const { login } = await sdk().login({ email, password })

    if (!login.secret) {
      throw new Error('No secret present in login query response.')
    }

    req.session.set('user', login.instance)
    req.session.set('secret', login.secret)
    await req.session.save()

    res.status(200).json(login.instance)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message || error })
  }
})
