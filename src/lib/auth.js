import { cookies, headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';
import { signToken, verifyToken, hashToken } from '@/lib/jwt';
import { SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/authConstants';

export { SESSION_COOKIE, SESSION_MAX_AGE };

const ACCOUNT_SELECT = `
  id, email, full_name, role, email_verified, is_active,
  last_login_at, created_at, updated_at,
  profiles ( phone, bio, skills, experience, education, resume_url,
             location, website, linkedin, github, avatar_url ),
  user_settings ( email_notifications, job_alerts, profile_visibility, two_factor_auth )
`;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}

/**
 * Login ke baad session banata hai: JWT sign karke cookie set karta hai
 * aur uska hash `sessions` table me daalta hai (taake logout revoke ho sake).
 */
export async function createSession(accountId) {
  const supabase = getSupabaseAdmin();
  const token = await signToken({ sub: accountId }, SESSION_MAX_AGE);
  const tokenHash = await hashToken(token);

  let userAgent = null;
  let ipAddress = null;
  try {
    const headerList = await headers();
    userAgent = headerList.get('user-agent');
    ipAddress = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  } catch {
    // headers() sirf request scope me available hoti hai
  }

  const { error } = await supabase.from('sessions').insert({
    account_id: accountId,
    token_hash: tokenHash,
    user_agent: userAgent,
    ip_address: ipAddress,
    expires_at: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString(),
  });

  if (error) throw new Error(`Session banane me error: ${error.message}`);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, cookieOptions());

  await supabase
    .from('accounts')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', accountId);

  return token;
}

/** Logout: DB session revoke + cookie clear. */
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('token_hash', await hashToken(token));
    } catch (error) {
      console.error('[auth] Session revoke failed:', error.message);
    }
  }

  cookieStore.set(SESSION_COOKIE, '', { ...cookieOptions(), maxAge: 0 });
}

/** Cookie se account id nikalta hai (JWT + DB session dono check karke). */
export async function getSessionAccountId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.sub) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('sessions')
    .select('account_id, expires_at, revoked_at')
    .eq('token_hash', await hashToken(token))
    .maybeSingle();

  if (error || !data) return null;
  if (data.revoked_at) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  return data.account_id;
}

/** Account id se pura record (profile + settings ke saath). */
export async function getAccountById(accountId) {
  if (!accountId) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('accounts')
    .select(ACCOUNT_SELECT)
    .eq('id', accountId)
    .maybeSingle();

  if (error || !data || !data.is_active) return null;

  return data;
}

/** Logged-in user ka pura record (profile + settings ke saath). Warna null. */
export async function getCurrentAccount() {
  const accountId = await getSessionAccountId();
  return getAccountById(accountId);
}

/** Account ko frontend-friendly shape me badalta hai. */
export function serializeAccount(account) {
  if (!account) return null;

  const profile = Array.isArray(account.profiles) ? account.profiles[0] : account.profiles;
  const settings = Array.isArray(account.user_settings)
    ? account.user_settings[0]
    : account.user_settings;

  const [firstName = '', ...restName] = (account.full_name || '').trim().split(/\s+/);

  return {
    id: account.id,
    email: account.email,
    name: account.full_name,
    firstName,
    lastName: restName.join(' '),
    role: account.role,
    emailVerified: account.email_verified,
    createdAt: account.created_at,
    updatedAt: account.updated_at,
    profile: {
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      skills: profile?.skills || [],
      experience: profile?.experience || '',
      education: profile?.education || '',
      resume: profile?.resume_url || '',
      location: profile?.location || '',
      website: profile?.website || '',
      linkedin: profile?.linkedin || '',
      github: profile?.github || '',
      avatar: profile?.avatar_url || '',
    },
    settings: {
      emailNotifications: settings?.email_notifications ?? true,
      jobAlerts: settings?.job_alerts ?? true,
      profileVisibility: settings?.profile_visibility ?? false,
      twoFactorAuth: settings?.two_factor_auth ?? false,
    },
  };
}

/** Email normalize (DB me hamesha lowercase store hota hai). */
export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
