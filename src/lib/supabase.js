/**
 * File: src/lib/supabase.js
 *
 * Creates the database connection. Every API route calls getSupabaseAdmin().
 *   .env.local / Netlify env  ->  createClient(URL, KEY)  ->  Supabase PostgreSQL
 * NEXT_PUBLIC_SUPABASE_URL      = the Supabase project address
 * SUPABASE_SERVICE_ROLE_KEY     = secret key, server only. It bypasses RLS, so it
 *                                 must never be used in browser code.
 * NEXT_PUBLIC_SUPABASE_ANON_KEY = public key (getSupabaseBrowser, currently unused)
 * Example: await getSupabaseAdmin().from('jobs').select('*')  // SELECT * FROM jobs
 */
import { createClient } from '@supabase/supabase-js';

let adminClient = null;
let browserClient = null;

/**
 * Server-only client. The service role key bypasses RLS, so use this only in
 * API routes / server code, never in a client component.
 */
export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing. Add it to .env.local');
  }
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing. Add it to .env.local');
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminClient;
}

/** Browser-safe client (anon key). Public reads only: jobs and companies. */
export function getSupabaseBrowser() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Add it to .env.local'
    );
  }

  browserClient = createClient(url, anonKey, { auth: { persistSession: false } });

  return browserClient;
}
