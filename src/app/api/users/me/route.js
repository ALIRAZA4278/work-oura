import { NextResponse } from 'next/server';
import { getCurrentAccount, serializeAccount } from '@/lib/auth';
import { updateCurrentAccount } from '@/lib/accounts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const account = await getCurrentAccount();

    if (!account) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(serializeAccount(account));
  } catch (error) {
    console.error('[GET /api/users/me] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const account = await getCurrentAccount();
    const body = await request.json();
    const result = await updateCurrentAccount(account, body);

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('[PUT /api/users/me] Error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
