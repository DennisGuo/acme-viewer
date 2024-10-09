import { getSessionUser } from "@/auth";
import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import path from "path";

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
      const data:{name:string,content:string}[] = [];
      const dir = path.join(
        process.env.LETSENCRYPT_LIVE_DIR || "/etc/letsencrypt/live",
        domain
      );
      fs.readdirSync(dir).forEach((name) => {
        const content = fs.readFileSync(path.join(dir, name)).toString();
        // buffer to string

        data.push({
          name,
          content
        });
      });

      res.status(200).json({ success: true, data })
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
}
