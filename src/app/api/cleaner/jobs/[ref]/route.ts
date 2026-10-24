import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { advanceByCleaner } from '@/lib/server/bookings';
import { readJson, route } from '@/lib/server/http';

export const PATCH = route<{ params: Promise<{ ref: string }> }>(async (req, { params }) => {
  const user = await requireUser('cleaner');
  const { ref } = await params;
  const body = await readJson(req);
  advanceByCleaner(user.id, ref, body.status);
  return NextResponse.json({ ok: true });
});
