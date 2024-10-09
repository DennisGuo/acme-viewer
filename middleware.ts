import type { NextRequest } from 'next/server'
import { getSessionUser } from './auth';
 
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value

  console.log('session', session );

  const user = getSessionUser(session); 
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return Response.redirect(new URL('/login', request.url))
  }else if(request.nextUrl.pathname == '/'){
    // home page 
    return Response.redirect(new URL('/dashboard', request.url))
  }
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}