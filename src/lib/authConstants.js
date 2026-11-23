/**
 * Auth constants — middleware (Edge runtime) aur server code dono
 * yahin se import karte hain, taake middleware ko `next/headers` ya
 * Supabase client import na karna pade.
 */
export const SESSION_COOKIE = 'wk_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 din
