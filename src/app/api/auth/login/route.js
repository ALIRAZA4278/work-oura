/**
 * DB CONNECTION MAP
 *
 * POST /api/auth/login  <- context/AuthContext.js (sign-in page)
 * Tables: accounts SELECT id, password_hash, is_active WHERE email = ?
 *   password verify -> sessions INSERT + cookie set (lib/auth.js).
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyPassword } from '@/lib/password';
import { createSession, getAccountById, serializeAccount, normalizeEmail } from '@/lib/auth';

const INVALID_MESSAGE = 'Email ya password ghalat hai';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email aur password dono zaroori hain' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: account, error } = await supabase
      .from('accounts')
      .select('id, password_hash, is_active')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('[POST /api/auth/login] Lookup failed:', error);
      return NextResponse.json({ error: 'Login fail ho gaya' }, { status: 500 });
    }

    // User enumeration se bachne ke liye same message dono cases me
    if (!account) {
      return NextResponse.json({ error: INVALID_MESSAGE }, { status: 401 });
    }

    const passwordOk = await verifyPassword(password, account.password_hash);
    if (!passwordOk) {
      return NextResponse.json({ error: INVALID_MESSAGE }, { status: 401 });
    }

    if (!account.is_active) {
      return NextResponse.json({ error: 'Ye account disable kar diya gaya hai' }, { status: 403 });
    }

    await createSession(account.id);

    const fullAccount = await getAccountById(account.id);

    return NextResponse.json({ message: 'Login ho gaya', user: serializeAccount(fullAccount) });
  } catch (error) {
    console.error('[POST /api/auth/login] Error:', error);
    return NextResponse.json({ error: 'Login fail ho gaya' }, { status: 500 });
  }
}
