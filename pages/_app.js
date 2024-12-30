import Layout from '../components/layout'
import '../app/globals.css'


export const metadata = {
  title: "ACME Viewer",
  description: "Web viewer for acme."
};
 
export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}