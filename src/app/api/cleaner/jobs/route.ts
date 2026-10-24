import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { listForCleaner } from '@/lib/server/bookings';
import { getDb } from '@/lib/server/db';
import { route } from '@/lib/server/http';
import { nowInBusinessTz } from '@/lib/dates';

export const GET = route(async () => {
  const user = await requireUser('cleaner');
  const today = nowInBusinessTz().date;
  return NextResponse.json({ today, jobs: listForCleaner(getDb(), user.id, today) });
});
