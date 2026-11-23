import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentAccount } from '@/lib/auth';
import { jobRowToApi, jobApiToRow } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

const JOB_SELECT = `
  id, recruiter_id, company_id, job_title, company_name, company_logo,
  job_description, job_type, experience_level, category, required_skills,
  location, salary_min, salary_max, deadline, is_test_required, openings,
  contact_email, apply_link, status, views, created_at, updated_at,
  recruiter:accounts!jobs_recruiter_id_fkey ( id, full_name, email )
`;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();

    const { data: job, error } = await supabase
      .from('jobs')
      .select(JOB_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[GET /api/jobs/[id]] Query failed:', error);
      return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
    }

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // View counter (fail hone par response nahi rukna chahiye)
    const { data: newViews } = await supabase.rpc('increment_job_views', { p_job_id: id });

    return NextResponse.json({ ...jobRowToApi(job), views: newViews ?? job.views ?? 0 });
  } catch (error) {
    console.error('[GET /api/jobs/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const account = await getCurrentAccount();
    if (!account) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();

    const { data: job } = await supabase
      .from('jobs')
      .select('id, recruiter_id')
      .eq('id', id)
      .maybeSingle();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.recruiter_id !== account.id && account.role !== 'admin') {
      return NextResponse.json({ error: 'You can only edit your own jobs' }, { status: 403 });
    }

    const body = await request.json();
    const updates = jobApiToRow(body, { partial: true });

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'Update karne ke liye kuch nahi mila' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select(JOB_SELECT)
      .single();

    if (error) {
      console.error('[PUT /api/jobs/[id]] Update failed:', error);
      return NextResponse.json(
        { error: 'Failed to update job', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(jobRowToApi(updated));
  } catch (error) {
    console.error('[PUT /api/jobs/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const account = await getCurrentAccount();
    if (!account) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();

    const { data: job } = await supabase
      .from('jobs')
      .select('id, recruiter_id')
      .eq('id', id)
      .maybeSingle();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.recruiter_id !== account.id && account.role !== 'admin') {
      return NextResponse.json({ error: 'You can only delete your own jobs' }, { status: 403 });
    }

    // applications ON DELETE CASCADE se khud delete ho jayengi
    const { error } = await supabase.from('jobs').delete().eq('id', id);

    if (error) {
      console.error('[DELETE /api/jobs/[id]] Delete failed:', error);
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/jobs/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
