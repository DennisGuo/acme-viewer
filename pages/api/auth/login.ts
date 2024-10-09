import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { signIn } from "@/auth";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { username, password } = req.body;

    const signed = signIn(username,password)
    
    const cookie = serialize(
      "session",
      signed,
      {
        httpOnly: true,
        // secure: true,
        maxAge: 60 * 60 * 24 * 7, // One week
        path: "/"
      }
    );
    res.setHeader("Set-Cookie", cookie);

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Invalid credentials." });
  }
}
