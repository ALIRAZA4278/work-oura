/**
 * File: src/app/api/applications/route.js
 *
 * GET  <- dashboard (Applications tab)
 *   job seeker: applications WHERE applicant_id = me
 *   recruiter : my job ids (jobs.recruiter_id = me) -> their applications
 *   ?jobId=   : one job's applications (only that job's recruiter)
 * POST <- job detail page (Apply form) -> lib/applications.js INSERT
 * Joins (APPLICATION_SELECT): applications.job_id -> jobs,
 *   applications.applicant_id -> accounts -> profiles
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentAccount } from '@/lib/auth';
import { applicationRowToApi } from '@/lib/mappers';
import { createApplication, APPLICATION_SELECT, UUID_RE } from '@/lib/applications';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const account = await getCurrentAccount();

    if (!account) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    let query = supabase.from('applications').select(APPLICATION_SELECT);

    if (jobId) {
      if (!UUID_RE.test(jobId)) {
        return NextResponse.json([], { status: 200 });
      }

      // Only the job's owner can see its applications
      const { data: job } = await supabase
        .from('jobs')
        .select('id, recruiter_id')
        .eq('id', jobId)
        .maybeSingle();

      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      if (job.recruiter_id !== account.id && account.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      query = query.eq('job_id', jobId);
    } else if (account.role === 'recruiter') {
      // Recruiter: applications for all of their jobs
      const { data: myJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('recruiter_id', account.id);

      const jobIds = (myJobs || []).map((job) => job.id);
      if (!jobIds.length) {
        return NextResponse.json([]);
      }
      query = query.in('job_id', jobIds);
    } else if (account.role === 'admin') {
      // Admin sees everything, no filter
    } else {
      // Job seeker: only their own applications
      query = query.eq('applicant_id', account.id);
    }

    const { data, error } = await query.order('applied_at', { ascending: false });

    if (error) {
      console.error('[GET /api/applications] Query failed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json((data || []).map(applicationRowToApi));
  } catch (error) {
    console.error('[GET /api/applications] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const account = await getCurrentAccount();
    const body = await request.json();

    const result = await createApplication({
      account,
      jobId: body.jobId,
      body,
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('[POST /api/applications] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create application', details: error.message },
      { status: 500 }
    );
  }
}
