/**
 * DB CONNECTION MAP
 *
 * GET   <- (ek application)  applications SELECT WHERE id = ?
 * PATCH <- app/dashboard/page.js (status dropdown)
 *   applications.job_id -> jobs.recruiter_id check (sirf us job ka recruiter)
 *   applications UPDATE status  (pending / reviewing / interview / rejected / hired)
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentAccount } from '@/lib/auth';
import { applicationRowToApi } from '@/lib/mappers';
import { APPLICATION_SELECT, UUID_RE } from '@/lib/applications';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = ['pending', 'reviewing', 'interview', 'rejected', 'hired'];

export async function GET(request, context) {
  try {
    const account = await getCurrentAccount();
    if (!account) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();

    const { data: application, error } = await supabase
      .from('applications')
      .select(APPLICATION_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[GET /api/applications/[id]] Query failed:', error);
      return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
    }

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Sirf applicant khud, job ka recruiter, ya admin dekh sakta hai
    const { data: job } = await supabase
      .from('jobs')
      .select('recruiter_id')
      .eq('id', application.job_id)
      .maybeSingle();

    const allowed =
      application.applicant_id === account.id ||
      job?.recruiter_id === account.id ||
      account.role === 'admin';

    if (!allowed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(applicationRowToApi(application));
  } catch (error) {
    console.error('[GET /api/applications/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    const account = await getCurrentAccount();
    if (!account) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await request.json();

    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Status in me se hona chahiye: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: application } = await supabase
      .from('applications')
      .select('id, job_id')
      .eq('id', id)
      .maybeSingle();

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Sirf job ka recruiter (ya admin) status badal sakta hai
    const { data: job } = await supabase
      .from('jobs')
      .select('recruiter_id')
      .eq('id', application.job_id)
      .maybeSingle();

    if (job?.recruiter_id !== account.id && account.role !== 'admin') {
      return NextResponse.json(
        { error: 'Sirf apni jobs ki applications update kar sakte hain' },
        { status: 403 }
      );
    }

    const { data: updated, error } = await supabase
      .from('applications')
      .update({ status: body.status })
      .eq('id', id)
      .select(APPLICATION_SELECT)
      .single();

    if (error) {
      console.error('[PATCH /api/applications/[id]] Update failed:', error);
      return NextResponse.json(
        { error: 'Failed to update application', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(applicationRowToApi(updated));
  } catch (error) {
    console.error('[PATCH /api/applications/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
