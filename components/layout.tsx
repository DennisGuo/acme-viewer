


import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {

  useEffect(() => {
    document.title = 'Certbot Viewer'
  }, [])

  return <>
      <div className="w-screen h-screen overflow-y-auto">{children}</div>
      <ToastContainer />
      </>;
}
