import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cookie = serialize("session", "", {
    httpOnly: true,
    // secure: true,
    maxAge: -1,
    path: "/"
  });
  res.setHeader("Set-Cookie", cookie);

  res.status(200).json({ success: true });
}
