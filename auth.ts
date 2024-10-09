import md5 from "md5";

/**
 * @description session info
 */
export interface SessionPayload {
  username: string;
  time: number;
  sign: string | undefined;
}

/**
 * sign with username and password, 
 * @param username 
 * @param password 
 * @returns the signed data
 */
export const signIn = (username: string, password: string) => {
  if (
    username !== process.env.AUTH_USER ||
    password !== process.env.AUTH_PASS
  ) {
    throw new Error("Invalid credentials.");
  }

  const time = new Date().getTime();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data  = { username, time } as SessionPayload;
  const sign = md5(JSON.stringify(data) + process.env.AUTH_SALT);
  data.sign = sign;

  return JSON.stringify(data)
};

/**
 * validate session data and get userinfo . 
 * @param data session data 
 * @returns userinfo.
 */
export const getSessionUser = (data:string|undefined|null)=>{

  if(data){
    const {username,time,sign } = JSON.parse(data) as SessionPayload;
    if(sign === md5(JSON.stringify({username,time}) + process.env.AUTH_SALT)){
      return {username,time};
    }else{
      throw new Error("Invalid session.");
    }
  }

  return null;
}
