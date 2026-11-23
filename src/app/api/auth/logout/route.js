/**
 * File: src/app/api/auth/logout/route.js
 *
 * POST /api/auth/logout  <- context/AuthContext.js (Navbar logout)
 * UPDATE sessions SET revoked_at = now() for this token, and clears the cookie.
 */
import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ message: 'Logged out' });
  } catch (error) {
    console.error('[POST /api/auth/logout] Error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
