import * as fs from "fs";
import path from "path";
import { PeerCertificate, TLSSocket } from "tls";
import { Duplex } from "stream";
import { JSONFilePreset } from 'lowdb/node'

// const keyv = new Keyv({
//   store: new KeyvFile({
//     filename: "./data/domains.json"
//   })
// });

const store = await JSONFilePreset('./data/data.json', {paths:[] as string[]})

export type DomainGroup = {
  path: string;
  domains: Domain[];
};

export type Domain = {
  name: string;
  cert?: Cert;
};
export type Cert = {
  valid_from: string;
  valid_to: string;
  fullchain: string;
  key: string;
};

/**
 * 获取所有域名
 * @returns
 */
export async function getDomainGroupss(): Promise<DomainGroup[]> {
  let rs: DomainGroup[] = [];

  const paths = await getPaths();
  console.log('db paths ', paths )
  rs = paths.map((path) => {
    let domains: Domain[] = getDomainsByPath(path);

    return {
      path,
      domains
    } as DomainGroup;
  });
  return rs;
}
/**
 * 根据配置的路径，扫描出所有域名
 * @param dir 
 * @returns 
 */
function getDomainsByPath(dir: string): Domain[] {
  const domainNames: string[] = [];
  console.log('getDomainsByPath',dir);
  const names = fs.readdirSync(dir);
  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    let filePath = path.join(dir, name);
    const isDir = fs.lstatSync(filePath).isDirectory();
    if (isDir && !["ca", "deploy", "dnsapi", "notify"].includes(name)) {
      domainNames.push(name);
    }
  }

  return domainNames.map((name) => readCert(dir, name));
}

/**
 * 移除扫描路径
 * @param path 
 * @returns 
 */
export async function removePath(path:string): Promise<boolean>{
  console.log('remove path ', path );
  if(!path){
    return false
  }
  // const arr = await getPaths();
  // if (!arr.includes(path)) {
  //   return false;
  // }
  // arr.splice(arr.indexOf(path), 1);
  // return await keyv.set("paths", arr);
  await store.update(({paths})=>{
    if(!paths.includes(path)){
      return false
    }
    paths.splice(paths.indexOf(path), 1)
  })
  return true
}
/**
 * 保存扫描路径
 * @param path
 */
export async function addPath(path: string): Promise<boolean> {
  console.log('add path ', path );
  if(!path){
    return false
  }
  // const arr = await getPaths();
  // if (arr.includes(path)) {
  //   return false;
  // }
  // arr.push(path);
  // return await keyv.set("paths", arr);
  await store.update(({paths})=>{
    if(paths.includes(path)){
      return false
    }
    paths.push(path)
  })
  return true
}
/**
 * 获取保存的扫描路径
 * @returns
 */
export async function getPaths(): Promise<string[]> {
  // return (await keyv.get("paths")) || [];
  return store.data.paths || []
}
/**
 * 读取某个域名目录
 * @param dir   域名目录
 * @param name  域名 
 * @returns 
 */
function readCert(dir: string, name: string): Domain {
  const parent = path.join(dir, name);
  const names = fs.readdirSync(parent);
  const rs: Domain = { name } as Domain;
  const cert: Cert = {} as Cert;
  names.forEach((fileName) => {
    if (fileName == "fullchain.cer") {
      const certPath = path.join(parent, fileName);
      try {
        const socket = new TLSSocket(new Duplex(), {
          cert: fs.readFileSync(certPath)
        });
        const certifacate = socket.getCertificate();
        if (certifacate) {
          cert.valid_from = (certifacate as PeerCertificate).valid_from;
          cert.valid_to = (certifacate as PeerCertificate).valid_to;
        }
        const content = fs.readFileSync(certPath).toString();
        cert.fullchain = content;

        socket.destroy();
      } catch (e) {
        console.log(e);
      }
    }
    if (fileName.endsWith(".key")) {
      const content = fs.readFileSync(path.join(parent, fileName)).toString();
      cert.key = content;
    }
  });
  rs.cert = cert;

  return rs;  
}
