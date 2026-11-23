/**
 * File: src/lib/accounts.js
 *
 * Profile / settings update for PUT /api/users (dashboard Profile tab).
 * Tables:
 *   accounts      UPDATE full_name, role
 *   profiles      UPSERT by account_id: phone, bio, skills[], experience, education,
 *                 resume_url, location, website, linkedin, github, avatar_url
 *   user_settings UPSERT: email_notifications, job_alerts, profile_visibility,
 *                 two_factor_auth
 * UPSERT = UPDATE the row if it exists, otherwise INSERT it.
 */
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentAccount, serializeAccount } from '@/lib/auth';
import { toStringArray } from '@/lib/mappers';

const ALLOWED_ROLES = ['job_seeker', 'recruiter'];

/**
 * Updates the logged-in account's name, role, profile and settings.
 * Used by `PUT /api/users`.
 *
 * @returns {{status: number, body: object}}
 */
export async function updateCurrentAccount(account, body = {}) {
  if (!account) {
    return { status: 401, body: { error: 'Unauthorized' } };
  }

  const supabase = getSupabaseAdmin();

  // ---- accounts table ----
  const accountUpdates = {};

  if (typeof body.name === 'string' && body.name.trim()) {
    accountUpdates.full_name = body.name.trim();
  } else if (body.firstName !== undefined || body.lastName !== undefined) {
    const merged = `${body.firstName || ''} ${body.lastName || ''}`.trim();
    if (merged) accountUpdates.full_name = merged;
  }

  if (body.role !== undefined) {
    if (!ALLOWED_ROLES.includes(body.role)) {
      return { status: 400, body: { error: 'Role must be job_seeker or recruiter' } };
    }
    accountUpdates.role = body.role;
  }

  if (Object.keys(accountUpdates).length) {
    const { error } = await supabase.from('accounts').update(accountUpdates).eq('id', account.id);
    if (error) {
      console.error('[accounts] Account update failed:', error);
      return { status: 500, body: { error: 'Could not update the profile' } };
    }
  }

  // ---- profiles table ----
  if (body.profile && typeof body.profile === 'object') {
    const p = body.profile;
    const profileUpdates = { account_id: account.id };

    if (p.phone !== undefined) profileUpdates.phone = p.phone || null;
    if (p.bio !== undefined) profileUpdates.bio = p.bio || null;
    if (p.skills !== undefined) profileUpdates.skills = toStringArray(p.skills);
    if (p.experience !== undefined) profileUpdates.experience = p.experience || null;
    if (p.education !== undefined) profileUpdates.education = p.education || null;
    if (p.resume !== undefined) profileUpdates.resume_url = p.resume || null;
    if (p.location !== undefined) profileUpdates.location = p.location || null;
    if (p.website !== undefined) profileUpdates.website = p.website || null;
    if (p.linkedin !== undefined) profileUpdates.linkedin = p.linkedin || null;
    if (p.github !== undefined) profileUpdates.github = p.github || null;
    if (p.avatar !== undefined) profileUpdates.avatar_url = p.avatar || null;

    if (Object.keys(profileUpdates).length > 1) {
      const { error } = await supabase
        .from('profiles')
        .upsert(profileUpdates, { onConflict: 'account_id' });
      if (error) {
        console.error('[accounts] Profile update failed:', error);
        return { status: 500, body: { error: 'Could not update the profile' } };
      }
    }
  }

  // ---- user_settings table ----
  if (body.settings && typeof body.settings === 'object') {
    const s = body.settings;
    const settingsUpdates = { account_id: account.id };

    if (s.emailNotifications !== undefined) settingsUpdates.email_notifications = !!s.emailNotifications;
    if (s.jobAlerts !== undefined) settingsUpdates.job_alerts = !!s.jobAlerts;
    if (s.profileVisibility !== undefined) settingsUpdates.profile_visibility = !!s.profileVisibility;
    if (s.twoFactorAuth !== undefined) settingsUpdates.two_factor_auth = !!s.twoFactorAuth;

    if (Object.keys(settingsUpdates).length > 1) {
      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsUpdates, { onConflict: 'account_id' });
      if (error) {
        console.error('[accounts] Settings update failed:', error);
        return { status: 500, body: { error: 'Could not update the settings' } };
      }
    }
  }

  const refreshed = await getCurrentAccount();
  return { status: 200, body: serializeAccount(refreshed) };
}
