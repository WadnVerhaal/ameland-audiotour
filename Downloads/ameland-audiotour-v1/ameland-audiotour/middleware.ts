import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'wadn_admin_session'

function isProtectedPath(pathname: string) {
  return pathname.startsWith('/admin')
}

function isLoginPath(pathname: string) {
  return pathname === '/admin-login'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedPath(pathname) && !isLoginPath(pathname)) {
    return NextResponse.next()
  }

  const session = request.cookies.get(ADMIN_COOKIE)?.value
  const expected = process.env.ADMIN_ACCESS_TOKEN

  if (!expected) {
    if (isProtectedPath(pathname)) {
      return NextResponse.redirect(new URL('/admin-login?error=config', request.url))
    }
    return NextResponse.next()
  }

  if (isLoginPath(pathname)) {
    if (session === expected) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  if (session !== expected) {
    const loginUrl = new URL('/admin-login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login'],
}