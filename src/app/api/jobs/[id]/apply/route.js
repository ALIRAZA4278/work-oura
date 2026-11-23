import { NextResponse } from 'next/server';
import { getCurrentAccount } from '@/lib/auth';
import { createApplication } from '@/lib/applications';

export const dynamic = 'force-dynamic';

export async function POST(request, context) {
  try {
    const account = await getCurrentAccount();
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));

    const result = await createApplication({ account, jobId: id, body });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('[POST /api/jobs/[id]/apply] Error:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
