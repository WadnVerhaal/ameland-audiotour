import { NextRequest, NextResponse } from 'next/server';

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
  });
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const ref = request.nextUrl.searchParams.get('ref');

  if (ref) {
    response.cookies.set('partner_ref', ref, {
      httpOnly: false,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Basic ')) return unauthorized();

    const base64 = auth.split(' ')[1] ?? '';
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    const [user, password] = decoded.split(':');

    if (user !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASSWORD) {
      return unauthorized();
    }
  }

  return response;
}

export const config = {
  matcher: ['/', '/tours/:path*', '/checkout/:path*', '/admin/:path*'],
};
