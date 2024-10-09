import * as fs from "fs";
import { useRouter } from "next/router";
import { useState } from "react";
import copyIt from 'copy-to-clipboard';
import { saveAs } from "file-saver";
import {  toast } from "react-toastify";
import Empty from "@/components/empty";

export default function DashboardPage({
  domains
}: Readonly<{
  domains: string[];
}>) {
  const router = useRouter();
  const [crtDomain, setCrtDomain] = useState<string>();
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);

  const logout = async () => {
    // delete cookie
    const res = await fetch("/api/auth/logout");
    if (res.ok) {
      router.push("/login");
    } else {
      toast("Logout failed");
    }
  };

  const clickDomain = async (domain: string) => {
    setCrtDomain(domain);

    const res = await fetch(`/api/domain/detail?domain=${domain}`);
    if (res.ok) {
      const arr = (await res.json()).data;
      setFiles(arr);
    } else {
      setFiles([]);
      toast("Failed to get domain detail");
    }
  };

  const toCopy = (content: string) => {
    console.log('copy',content);
    copyIt(content);
    toast("Copied!");
  };

  const toDownload = (item: { name: string; content: string }) => {
    const blob = new Blob([item.content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, item.name);
  };

  return (
    <div className="flex flex-col h-screen">
      <h1 className="bg-blue-300 text-white px-4 py-2 flex flex-row text-lg text-bold items-center justify-start">
        <div className="flex-1">Certbot Viewer</div>
        <div className="text-slate-100 cursor-pointer text-sm" onClick={logout}>
          {" "}
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
                .filter((i) => i != "README")
                .map((domain) => (
                  <div
                    className={
                      "p-2 rounded  hover:bg-blue-100 cursor-pointer " +
                      (crtDomain == domain ? "bg-blue-100" : "bg-gray-100")
                    }
                    key={domain}
                    onClick={() => clickDomain(domain)}
                  >
                    {domain}
                  </div>
                ))}
            </div>
            {domains.length == 0 ? <Empty text="No domain exists." /> : null}
          </div>
        </div>
        <div className="p-4 flex-1">
          <h2 className="py-2 text-bold border border-t-0 border-l-0 border-r-0">
            Domain Details {crtDomain ? ` / ` + crtDomain : ""}
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {files.map((item) => (
              <div
                className="p-2 hover:shadow-2xl rounded flex flex-col gap-y-2"
                key={item.name}
              >
                <div className="text-slate-400">{item.name}</div>
                <textarea
                  className="h-80 bg-slate-100 p-2"
                  defaultValue={item.content}
                ></textarea>
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

function readFiles(path: string): string[] {
  return fs.readdirSync(path);
}
