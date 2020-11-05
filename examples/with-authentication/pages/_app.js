import Head from 'next/head'
import AccountContainer from '|lib/accountContainer'

const MyApp = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>Faugra Authentication / Authorization demo</title>
    </Head>
    <AccountContainer.Provider>
      <Component {...pageProps} />
    </AccountContainer.Provider>
  </>
)

export default MyApp
