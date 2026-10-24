import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { cancelByCustomer, getForCustomer, rescheduleByCustomer } from '@/lib/server/bookings';
import { getDb } from '@/lib/server/db';
import { HttpError, readJson, route } from '@/lib/server/http';

type Ctx = { params: Promise<{ ref: string }> };

export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser('customer');
  const { ref } = await params;
  return NextResponse.json({ booking: getForCustomer(getDb(), user.id, ref) });
});

export const PATCH = route<Ctx>(async (req, { params }) => {
  const user = await requireUser('customer');
  const { ref } = await params;
  const body = await readJson(req);
  if (body.action === 'cancel') cancelByCustomer(user.id, ref);
  else if (body.action === 'reschedule') rescheduleByCustomer(user.id, ref, body.date, body.startMin);
  else throw new HttpError(400, 'Unknown action.');
  return NextResponse.json({ booking: getForCustomer(getDb(), user.id, ref) });
});
