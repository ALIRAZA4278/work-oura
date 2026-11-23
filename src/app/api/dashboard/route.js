/**
 * File: src/app/api/dashboard/route.js
 *
 * GET /api/dashboard  <- dashboard (My Jobs + stats)
 *   SELECT FROM jobs WHERE recruiter_id = the logged-in account
 *   applications ( count ) counts each job's applications through the job_id FK
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentAccount } from '@/lib/auth';
import { jobRowToApi } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

/** The logged-in recruiter's own posted jobs, with application counts. */
export async function GET() {
  try {
    const account = await getCurrentAccount();

    if (!account) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('jobs')
      .select(
        `
        id, recruiter_id, company_id, job_title, company_name, company_logo,
        job_description, job_type, experience_level, category, required_skills,
        location, salary_min, salary_max, deadline, is_test_required, openings,
        contact_email, apply_link, status, views, created_at, updated_at,
        applications ( count )
      `
      )
      .eq('recruiter_id', account.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/dashboard] Query failed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json((data || []).map(jobRowToApi));
  } catch (error) {
    console.error('[GET /api/dashboard] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
