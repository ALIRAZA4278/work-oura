/**
 * File: src/app/api/auth/signup/route.js
 *
 * POST /api/auth/signup  <- context/AuthContext.js (sign-up page)
 * Checks the email is free (SELECT accounts), hashes the password and inserts
 * into accounts (email, password_hash, full_name, role). Database triggers then
 * create the profiles and user_settings rows. Finally logs the user in
 * (INSERT sessions + cookie).
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { hashPassword, validatePassword } from '@/lib/password';
import { createSession, getAccountById, serializeAccount, normalizeEmail, isValidEmail } from '@/lib/auth';

const ALLOWED_ROLES = ['job_seeker', 'recruiter'];

export async function POST(request) {
  try {
    const body = await request.json();

    const name = String(body.name || '').trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    const role = ALLOWED_ROLES.includes(body.role) ? body.role : 'job_seeker';

    if (!name) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from('accounts')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({ email, password_hash: passwordHash, full_name: name, role })
      .select('id')
      .single();

    if (error) {
      // 23505 = unique violation (race condition)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }
      console.error('[POST /api/auth/signup] Insert failed:', error);
      return NextResponse.json({ error: 'Could not create the account' }, { status: 500 });
    }

    await createSession(account.id);

    const fullAccount = await getAccountById(account.id);

    return NextResponse.json(
      { message: 'Account created', user: serializeAccount(fullAccount) },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/auth/signup] Error:', error);
    return NextResponse.json({ error: 'Sign up failed' }, { status: 500 });
  }
}
