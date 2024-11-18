import * as fs from "fs";
import path from "path";
import { useRouter } from "next/router";
import { useState } from "react";
import copyIt from "copy-to-clipboard";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import Empty from "@/components/empty";
import dayjs from "dayjs";
import { PeerCertificate, TLSSocket } from "tls";
import { Duplex } from "stream";

type Domain = {
  name: string;
  cert?: Cert;
};
type Cert = {
  valid_from: string;
  valid_to: string;
};

export default function DashboardPage({
  domains
}: Readonly<{
  domains: Domain[];
}>) {
  const router = useRouter();
  const [crtDomain, setCrtDomain] = useState<Domain>();
  const [files, setFiles] = useState<
    { name: string; content: string; cert?: PeerCertificate }[]
  >([]);

  const logout = async () => {
    // delete cookie
    const res = await fetch("/api/auth/logout");
    if (res.ok) {
      router.push("/login");
    } else {
      toast("Logout failed");
    }
  };

  const clickDomain = async (domain: Domain) => {
    setCrtDomain(domain);

    const res = await fetch(`/api/domain/detail?domain=${domain.name}`);
    if (res.ok) {
      const arr = (await res.json()).data;
      setFiles(arr);
    } else {
      setFiles([]);
      toast("Failed to get domain detail");
    }
  };

  const toCopy = (content: string) => {
    console.log("copy", content);
    copyIt(content);
    toast("Copied!");
  };

  const toDownload = (item: { name: string; content: string }) => {
    const blob = new Blob([item.content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, item.name);
  };

  // const Certinfo = ({ cert }: { cert: PeerCertificate }) => {
  //   const from = dayjs(cert?.valid_from);
  //   const to = dayjs(new Date(cert?.valid_to));
  //   const fmt = "YYYY/MM/DD";

  //   return (
  //     <div className="inline-block float-right bg-slate-300 rounded-xl cursor-pointer text-xs py-1 px-2">
  //       <div>
  //         {from.format(fmt)} - {to.format(fmt)}
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div className="flex flex-col h-screen">
      <h1 className="bg-blue-300 text-white px-4 py-2 flex flex-row text-lg text-bold items-center justify-start">
        <div className="flex-1">Certbot Viewer</div>
        <div className="text-slate-100 cursor-pointer text-sm" onClick={logout}>
          Logout{" "}
        </div>
      </h1>
      <div className="flex flex-row flex-1">
        <div className="w-80 p-4 border border-l-0 border-b-0 border-t-0 flex flex-col">
          <h2 className="py-2 text-bold border border-t-0 border-l-0 border-r-0">
            Domain List
          </h2>
          <div className="mt-4 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-y-2">
              {domains
                .filter((i) => i.name != "README")
                .map((domain) => (
                  <div
                    className={
                      "p-2 rounded  hover:bg-blue-100 cursor-pointer flex flex-col gap-y-2 " +
                      (crtDomain?.name == domain.name
                        ? "bg-blue-100"
                        : "bg-gray-100")
                    }
                    key={domain.name}
                    onClick={() => clickDomain(domain)}
                  >
                    <div>{domain.name}</div>
                    {domain.cert ? (
                      <div className="text-sm text-red-300">
                        {dayjs(
                          (domain.cert as PeerCertificate).valid_to
                        ).format("YYYY/MM/DD")}
                      </div>
                    ) : null}
                  </div>
                ))}
            </div>
            {domains.length == 0 ? <Empty text="No domain exists." /> : null}
          </div>
        </div>
        <div className="p-4 flex-1">
          <h2 className="py-2 text-bold border border-t-0 border-l-0 border-r-0">
            Domain Details {crtDomain ? ` / ` + crtDomain.name : ""}
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {files.map((item, index) => (
              <div
                className="p-2 hover:shadow-2xl rounded flex flex-col gap-y-2"
                key={index}
              >
                <div className="text-slate-400">{item.name}</div>
                <textarea
                  className="h-80 bg-slate-100 p-2"
                  value={item.content}
                />
                <div className="flex flex-row gap-x-4 justify-between">
                  <div
                    className="py-2 px-4 cursor-pointer bg-green-300 text-white rounded hover:bg-green-400"
                    onClick={() => toDownload(item)}
                  >
                    Download
                  </div>
                  <div
                    className="py-2 px-4 cursor-pointer bg-slate-300 text-white rounded hover:bg-slate-400"
                    onClick={() => toCopy(item.content)}
                  >
                    Copy
                  </div>
                </div>
              </div>
            ))}
            {!crtDomain ? (
              <Empty text="Plaese choose a domain first." />
            ) : files.length == 0 ? (
              <Empty text="There is no file in domain folder , please check." />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  // read file list from process.env.LETSENCRYPT_LIVE_DIR
  const domains = readFiles(
    process.env.LETSENCRYPT_LIVE_DIR || "/etc/letsencrypt/live"
  );

  // Pass data to the page via props
  return { props: { domains } };
}

function readFiles(dir: string): Domain[] {
  const names = fs.readdirSync(dir).filter((i) => !i.startsWith("."));
  return names.map((name) => {
    const item: Domain = { name: name };
    const certPath = path.join(dir, name, "fullchain.pem");
    if (fs.existsSync(certPath)) {
      try {
        const socket = new TLSSocket(new Duplex(), {
          cert: fs.readFileSync(certPath)
        });
        const cert = socket.getCertificate();
        if (cert) {
          item.cert = {
            valid_from: (cert as PeerCertificate).valid_from,
            valid_to: (cert as PeerCertificate).valid_to
          };
        }
        socket.destroy();
      } catch (e) {
        console.log(e);
      }
    }
    return item;
  });
}
