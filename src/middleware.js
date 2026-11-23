/**
 * File: src/middleware.js
 *
 * Route guard. Runs before /dashboard, /profile, /sign-in and /sign-up.
 * - Not logged in + protected page  -> redirect to /sign-in?redirect=...
 * - Logged in + sign-in/sign-up page -> redirect to /dashboard
 * Only checks the JWT in the "wk_session" cookie; no database call here.
 */
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { SESSION_COOKIE } from '@/lib/authConstants';

// Pages that need login
const PROTECTED_PATHS = ['/dashboard', '/profile'];

// Pages that make no sense once logged in
const AUTH_PATHS = ['/sign-in', '/sign-up'];

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;
  const isLoggedIn = !!payload?.sub;

  if (!isLoggedIn && PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/sign-in/:path*', '/sign-up/:path*'],
};
