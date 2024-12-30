import { getSessionUser } from "@/auth";
import { NextApiRequest, NextApiResponse } from "next";
import {  removePath } from "@/utils/db";

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
      const body = JSON.parse(req.body)
      console.log('req.body : ', body );
      console.log('req.body.path : ', body.path );

      const rs = await removePath(body.path )

      res.status(200).json({ success: true, data: rs });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
}
