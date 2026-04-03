import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  const isAuthPage = request.nextUrl.pathname.startsWith('/api/auth')
  const isAccessDenied = request.nextUrl.pathname === '/access-denied'
  const isPublic = isAuthPage || isAccessDenied

  if (!token && !isPublic) {
    const signInUrl = new URL('/api/auth/signin', request.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|nocap.png|nocap-animated.gif).*)',
  ],
}
