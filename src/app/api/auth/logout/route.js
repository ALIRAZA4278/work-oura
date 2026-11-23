/**
 * DB CONNECTION MAP
 *
 * POST /api/auth/logout  <- context/AuthContext.js (Navbar logout)
 * Tables: sessions UPDATE revoked_at = now()  (token band), cookie delete.
 */
import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ message: 'Logout ho gaya' });
  } catch (error) {
    console.error('[POST /api/auth/logout] Error:', error);
    return NextResponse.json({ error: 'Logout fail ho gaya' }, { status: 500 });
  }
}
