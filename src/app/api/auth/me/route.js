/**
 * File: src/app/api/auth/me/route.js
 *
 * GET /api/auth/me  <- context/AuthContext.js (every page load)
 * Returns the logged-in user (sessions -> accounts + profiles + user_settings),
 * or { user: null }.
 */
import { NextResponse } from 'next/server';
import { getCurrentAccount, serializeAccount } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const account = await getCurrentAccount();

    if (!account) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: serializeAccount(account) });
  } catch (error) {
    console.error('[GET /api/auth/me] Error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
