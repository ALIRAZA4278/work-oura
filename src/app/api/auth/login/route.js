/**
 * File: src/app/api/auth/login/route.js
 *
 * POST /api/auth/login  <- context/AuthContext.js (sign-in page)
 * SELECT id, password_hash, is_active FROM accounts WHERE email = ?
 * Verifies the password, then INSERT sessions + sets the cookie (lib/auth.js).
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyPassword } from '@/lib/password';
import { createSession, getAccountById, serializeAccount, normalizeEmail } from '@/lib/auth';

const INVALID_MESSAGE = 'Invalid email or password';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: account, error } = await supabase
      .from('accounts')
      .select('id, password_hash, is_active')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('[POST /api/auth/login] Lookup failed:', error);
      return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }

    // Same message in both cases so attackers cannot tell which emails exist
    if (!account) {
      return NextResponse.json({ error: INVALID_MESSAGE }, { status: 401 });
    }

    const passwordOk = await verifyPassword(password, account.password_hash);
    if (!passwordOk) {
      return NextResponse.json({ error: INVALID_MESSAGE }, { status: 401 });
    }

    if (!account.is_active) {
      return NextResponse.json({ error: 'This account has been disabled' }, { status: 403 });
    }

    await createSession(account.id);

    const fullAccount = await getAccountById(account.id);

    return NextResponse.json({ message: 'Logged in', user: serializeAccount(fullAccount) });
  } catch (error) {
    console.error('[POST /api/auth/login] Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
