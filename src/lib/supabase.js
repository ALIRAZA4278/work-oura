import { createClient } from '@supabase/supabase-js';

let adminClient = null;
let browserClient = null;

/**
 * Server-only client. Service role key RLS bypass karta hai,
 * isliye ye sirf API routes / server code me use karo — kabhi client component me nahi.
 */
export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL missing hai — .env.local me add karein');
  }
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY missing hai — .env.local me add karein');
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminClient;
}

/** Browser-safe client (anon key). Sirf public read ke liye — jobs aur companies. */
export function getSupabaseBrowser() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing hai — .env.local me add karein'
    );
  }

  browserClient = createClient(url, anonKey, { auth: { persistSession: false } });

  return browserClient;
}
