import { getSessionUser } from "@/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { PeerCertificate, TLSSocket } from "tls";
import * as fs from "fs";
import path from "path";
import { Duplex } from "stream";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = req.cookies["session"];
    const user = getSessionUser(session);
    if (!user) {
      return res.status(401).json({ success: false });
    } else {
      const domain = req.query.domain as string;
      const data: { name: string; content: string }[] = [];
      const dir = path.join(
        process.env.LETSENCRYPT_LIVE_DIR || "/etc/letsencrypt/live",
        domain
      );
      fs.readdirSync(dir).filter(i=>i.endsWith('.pem')).forEach((name) => {
        const certPath = path.join(dir, name);
        const content = fs.readFileSync(certPath).toString();
        // buffer to string
        // todo: read cert expiry date.
        let cert: object | null = null;
        if (name.endsWith(".pem") && name !== "privkey.pem") {
          try {
            const socket = new TLSSocket(new Duplex(), {
              cert: fs.readFileSync(certPath)
            });
            cert = socket.getCertificate();
            socket.destroy();
          } catch (e) {
            console.log(e);
          }
        }
        const rs: {
          name: string;
          content: string;
          cert?: PeerCertificate | null | object;
        } = {
          name,
          content
        };
        if (cert) {
          rs.cert = cert;
        }
        data.push(rs);
      });

      res.status(200).json({ success: true, data });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
}
