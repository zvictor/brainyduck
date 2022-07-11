import sdk from 'brainyduck'
import { NextApiResponse } from 'next'
import withSession, { ApiRequestWithSession } from '|lib/withSession'

export default withSession(async (req: ApiRequestWithSession, res: NextApiResponse) => {
  try {
    const user = req.session.get('user')
    const secret = req.session.get('secret')
    req.session.destroy()

    const { logout } = await sdk({ secret }).logout()

    res.json(logout ? 'null' : user)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message || error })
  }
})
