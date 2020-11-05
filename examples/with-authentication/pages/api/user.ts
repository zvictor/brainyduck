import { NextApiResponse } from 'next'
import withSession, { ApiRequestWithSession } from '|lib/withSession'

export default withSession(async (req: ApiRequestWithSession, res: NextApiResponse) => {
  const user = req.session.get('user')

  res.json(user || 'null')
})
