import { NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/server/accounts';
import { getSessionUser, requireUser } from '@/lib/server/auth';
import { createBooking, listForCustomer, parseDraft } from '@/lib/server/bookings';
import { getCatalog } from '@/lib/server/catalog';
import { getDb } from '@/lib/server/db';
import { clientIp, HttpError, rateLimit, readJson, route } from '@/lib/server/http';

export const GET = route(async () => {
  const user = await requireUser('customer');
  return NextResponse.json({ bookings: listForCustomer(getDb(), user.id) });
});

export const POST = route(async (req) => {
  rateLimit(`book:${clientIp(req)}`, 20, 60 * 60 * 1000);
  const body = await readJson(req);
  const draft = parseDraft(body, getCatalog());

  const key = typeof body.requestKey === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(body.requestKey) ? body.requestKey : null;

  const user = await getSessionUser();
  if (user && user.role !== 'customer') {
    throw new HttpError(403, 'Staff accounts cannot make bookings. Please log out first.');
  }
  let customerId = user?.id;
  if (!customerId) {
    if (!body.account || typeof body.account !== 'object') throw new HttpError(401, 'Please create an account or log in to book.');
    customerId = await registerCustomer(body.account as Record<string, unknown>);
  }

  const ref = createBooking(customerId, draft, key);
  return NextResponse.json({ ref }, { status: 201 });
});
