import { NextApiRequest } from 'next'
import { withIronSession, Handler, Session } from 'next-iron-session'

export interface ApiRequestWithSession extends NextApiRequest {
  session: Session
}

export default (handler: Handler) =>
  withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD!,
    cookieName: 'authorization',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production' ? true : false,
    },
  })
