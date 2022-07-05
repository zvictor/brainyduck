if (!process.env.FAUNA_SECRET) {
  throw new Error('Please define `process.env.FAUNA_SECRET`')
}

module.exports = {
  env: {
    SECRET_COOKIE_PASSWORD: 'ZBfcR7cmYAg6zD9uYeSVYTaaWbReqzvr',
  },
}
