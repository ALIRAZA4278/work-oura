/**
 * File: src/lib/authConstants.js
 *
 * Cookie name and session length. Kept in a tiny separate file so the
 * middleware (Edge runtime) can import them without pulling in next/headers or
 * the Supabase client.
 */
export const SESSION_COOKIE = 'wk_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
