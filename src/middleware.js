import { NextResponse } from 'next/server';

export function middleware(request) {
  // Protected routes — redirect to login if no auth cookie
  const protectedPaths = ['/dashboard', '/candidates', '/jobs', '/pipeline', '/interviews', '/team', '/settings'];
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    // Check for Supabase auth cookie (sb-*-auth-token)
    const hasAuth = request.cookies.getAll().some((c) => c.name.includes('auth-token'));
    if (!hasAuth) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/candidates/:path*', '/jobs/:path*', '/pipeline/:path*', '/interviews/:path*', '/team/:path*', '/settings/:path*'],
};
