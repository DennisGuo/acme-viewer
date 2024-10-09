import Layout from '../components/layout'
import '../app/globals.css'


export const metadata = {
  title: "Certbot Viewer",
  description: "Web viewer for certbot."
};
 
export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}