import { getSessionUser } from "@/auth";
import { NextApiRequest, NextApiResponse } from "next";
import archiver from "archiver";
import * as path from "path";

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
      const dir = req.query.dir || "";
      const name = req.query.name || "";
      const arch = archiver("zip");
      if(!dir || !name){
        return res.status(400).json({ success: false, message: 'Need dir and name query parameter.' });
      }
      res.writeHead(200, {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=${name}.zip`
      });
      arch.on("error", (err) => {
        console.log(err);
        res.status(500).json({ success: false, err });
      });
      arch.pipe(res);
      arch.directory(path.join(dir as string , name as string), false);
      arch.finalize();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
}
