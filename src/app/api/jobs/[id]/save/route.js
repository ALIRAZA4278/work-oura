import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentAccount } from '@/lib/auth';
import { UUID_RE } from '@/lib/applications';

export const dynamic = 'force-dynamic';

/** Job ko saved list me daalta hai (pehle se saved ho to bhi 200 deta hai). */
export async function POST(request, context) {
  try {
    const account = await getCurrentAccount();
    if (!account) {
      return NextResponse.json({ error: 'Job save karne ke liye login karein' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();

    const { data: job } = await supabase.from('jobs').select('id').eq('id', id).maybeSingle();
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('saved_jobs')
      .upsert({ account_id: account.id, job_id: id }, { onConflict: 'account_id,job_id' });

    if (error) {
      console.error('[POST /api/jobs/[id]/save] Insert failed:', error);
      return NextResponse.json({ error: 'Job save nahi hui' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Job saved', saved: true });
  } catch (error) {
    console.error('[POST /api/jobs/[id]/save] Error:', error);
    return NextResponse.json({ error: 'Job save nahi hui' }, { status: 500 });
  }
}

/** Saved list se job hata deta hai. */
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
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('account_id', account.id)
      .eq('job_id', id);

    if (error) {
      console.error('[DELETE /api/jobs/[id]/save] Delete failed:', error);
      return NextResponse.json({ error: 'Job unsave nahi hui' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Job unsaved', saved: false });
  } catch (error) {
    console.error('[DELETE /api/jobs/[id]/save] Error:', error);
    return NextResponse.json({ error: 'Job unsave nahi hui' }, { status: 500 });
  }
}
