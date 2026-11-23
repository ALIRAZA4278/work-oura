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
      return NextResponse.json({ error: 'Full name required hai' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email address daalein' }, { status: 400 });
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
        { error: 'Is email se account pehle se mojood hai. Login karein.' },
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
          { error: 'Is email se account pehle se mojood hai. Login karein.' },
          { status: 409 }
        );
      }
      console.error('[POST /api/auth/signup] Insert failed:', error);
      return NextResponse.json({ error: 'Account nahi ban saka' }, { status: 500 });
    }

    await createSession(account.id);

    const fullAccount = await getAccountById(account.id);

    return NextResponse.json(
      { message: 'Account ban gaya', user: serializeAccount(fullAccount) },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/auth/signup] Error:', error);
    return NextResponse.json({ error: 'Signup fail ho gaya' }, { status: 500 });
  }
}
