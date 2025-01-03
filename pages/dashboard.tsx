import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import copyIt from "copy-to-clipboard";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import Empty from "@/components/empty";
import dayjs from "dayjs";
import { Domain, DomainGroup, getDomainGroupss } from "@/utils/db";

export default function DashboardPage({
  groups
}: Readonly<{
  groups: DomainGroup[];
}>) {
  const router = useRouter();
  const [crtDomain, setCrtDomain] = useState<Domain>();
  const [crtPath, setCrtPath] = useState<string>();

  const [form, setForm] = useState(false);
  const [path, setPath] = useState("");

  const files = useMemo<{ name: string; content: string }[]>((): {
    name: string;
    content: string;
  }[] => {
    if (!crtDomain) return [];
    return [
      {
        name: "fullchain.cert",
        content: crtDomain.cert?.fullchain || ""
      },
      {
        name: "private.key",
        content: crtDomain.cert?.key || ""
      }
    ];
  }, [crtDomain]);

  const logout = async () => {
    // delete cookie
    const res = await fetch("/api/auth/logout");
    if (res.ok) {
      router.push("/login");
    } else {
      toast("Logout failed");
    }
  };

  const clickDomain = async (path:string, domain: Domain) => {
    setCrtPath(path)
    setCrtDomain(domain);
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

  const onInputChange = (e: any) => {
    const path = e.target.value as string;
    setPath(path);
  };

  const toSave = async () => {
    if (!path) {
      alert("Plase input scan path !");
      return;
    }

    const ok = confirm("Confirm to add path?");
    if (ok) {
      const res = await fetch(`/api/domain/add`, {
        method: "POST",
        body: JSON.stringify({ path })
      });
      const json = await res.json();
      if (json.data) {
        window.location.reload();
        alert("Add Success !");
      } else {
        alert("Add Failed !");
      }
    }
  };

  const removePath = async (path: string) => {
    const ok = confirm(`Confirm to remove【${path}】 path ?`);
    if (ok) {
      const res = await fetch(`/api/domain/remove`, {
        method: "POST",
        body: JSON.stringify({ path })
      });
      const json = await res.json();
      if (json.data) {
        window.location.reload();
        alert("Remove Success !");
      } else {
        alert("Remove Failed !");
      }
    }
  };

  const toDownloadZip = (name: string) => {
    const dir = crtPath || ''
    const url = `/api/domain/download-zip?dir=${encodeURIComponent(dir)}&name=${name}`;
    window.open(url);
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
        <div className="flex-1">ACME Viewer</div>
        <div className="text-slate-100 cursor-pointer text-sm" onClick={logout}>
          Logout
        </div>
      </h1>
      <div className="flex flex-row flex-1">
        <div className="w-100 p-4 border border-l-0 border-b-0 border-t-0 flex flex-col">
          <h2 className="py-2 text-bold border border-t-0 border-l-0 border-r-0 ">
            Domain List
          </h2>
          <div className="mt-4 flex-1 overflow-y-auto">
            <div className="mb-2">
              {form ? (
                <div className="flex flex-row gap-x-2">
                  <input
                    type="text"
                    placeholder="/home/user/.acme.sh"
                    className="p-2 rounded py-1 px-2 border border-blue-400 w-full"
                    onChange={onInputChange}
                  />
                  <button
                    className="bg-blue-400 py-1 px-2 text-sm w-[70px] rounded"
                    onClick={(e) => toSave()}
                  >
                    Add
                  </button>
                  <button
                    className=" py-1 px-2 text-sm w-[70px]"
                    onClick={(e) => setForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="bg-blue-400 py-1 px-2 text-sm rounded"
                  onClick={(e) => setForm(true)}
                >
                  AddPath
                </button>
              )}
            </div>
            <div className="flex flex-col gap-y-2">
              {groups.map((group) => {
                return (
                  <div key={group.path}>
                    <div className="bg-slate-300 p-2 flex flex-row gap-x-2">
                      <div className="flex-1 break-all">{group.path}</div>
                      <div className="px-2">
                        <button
                          className="text-red-400 cursor-pinter text-sm"
                          onClick={(e) => removePath(group.path)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="pl-4 flex flex-col gap-y-1 mt-1">
                      {group.domains.map((domain) => {
                        return (
                          <div
                            className={
                              "p-2  hover:bg-blue-100 cursor-pointer flex flex-col " +
                              (crtDomain?.name == domain.name
                                ? "bg-blue-100"
                                : "bg-gray-100")
                            }
                            key={domain.name}
                            onClick={() => clickDomain(group.path,domain)}
                          >
                            <div>{domain.name}</div>
                            {domain.cert ? (
                              <div
                                className={`text-sm ${
                                  dayjs(domain.cert.valid_to).isBefore(
                                    dayjs().add(15, "day")
                                  )
                                    ? "text-red-400"
                                    : "text-green-500"
                                }`}
                              >
                                {dayjs(domain.cert.valid_to).format(
                                  "YYYY/MM/DD"
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {groups.length == 0 ? (
              <Empty text="No .acme.sh path exists." />
            ) : null}
          </div>
        </div>
        <div className="p-4 flex-1">
          <h2 className="py-2 text-bold border border-t-0 border-l-0 border-r-0 flex flex-row gap-x-4">
            <div className="flex-1">
              Domain Details {crtDomain ? ` / ` + crtDomain.name : ""}
            </div>
            {crtDomain?.name ? (
              <div>
                <div
                  className="py-2 px-4 cursor-pointer bg-slate-300 text-white rounded hover:bg-slate-400"
                  onClick={() => toDownloadZip(crtDomain.name)}
                >
                  Download Zip
                </div>
              </div>
            ) : null}
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
  // const domains = readFiles(
  //   process.env.LETSENCRYPT_LIVE_DIR || "/etc/letsencrypt/live"
  // );

  const groups = await getDomainGroupss();

  // Pass data to the page via props
  return { props: { groups } };
}
