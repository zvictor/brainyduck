import sdk from 'brainyduck'
import { NextApiResponse } from 'next'
import withSession, { ApiRequestWithSession } from '|lib/withSession'

export default withSession(async (req: ApiRequestWithSession, res: NextApiResponse) => {
  try {
    const { email, password } = await req.body

    if (!email || !password) {
      throw new Error('Email and password must be provided.')
    }

    const { signUp } = await sdk().signUp({ email, password })

    if (!signUp.secret) {
      throw new Error('No secret present in signUp query response.')
    }

    req.session.set('user', signUp.instance)
    req.session.set('secret', signUp.secret)
    await req.session.save()

    res.status(200).json(signUp.instance)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message || error })
  }
})
