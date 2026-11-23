/**
 * File: src/app/api/users/route.js
 *
 * GET /api/users  <- dashboard (load profile)
 *   accounts + profiles + user_settings (joined on account_id)
 * PUT /api/users  <- dashboard (Profile tab save, settings toggles)
 *   lib/accounts.js updates accounts / profiles / user_settings
 */
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
    console.error('[GET /api/users] Error:', error);
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
    console.error('[PUT /api/users] Error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
