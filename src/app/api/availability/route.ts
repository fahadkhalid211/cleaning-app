import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/auth';
import { parseJob, getForCustomer } from '@/lib/server/bookings';
import { getCatalog } from '@/lib/server/catalog';
import { getDb } from '@/lib/server/db';
import { clientIp, HttpError, rateLimit, readJson, route } from '@/lib/server/http';
import { assertBookableDate, availability } from '@/lib/server/scheduling';

// POST because the job size (and so its length) comes in the body.
// For a reschedule, pass the booking ref instead and we use that booking's own length.
export const POST = route(async (req) => {
  rateLimit(`availability:${clientIp(req)}`, 120, 60 * 1000);
  const body = await readJson(req);
  assertBookableDate(body.date);
  const db = getDb();

  if (body.ref !== undefined) {
    const user = await getSessionUser();
    if (!user || user.role !== 'customer') throw new HttpError(401, 'Please log in to continue.');
    const booking = getForCustomer(db, user.id, body.ref);
    const raw = db.prepare('SELECT id FROM bookings WHERE ref = ?').get(booking.ref) as { id: number };
    return NextResponse.json({ durationMin: booking.durationMin, slots: availability(db, body.date, booking.durationMin, raw.id) });
  }

  const job = parseJob(body, getCatalog());
  return NextResponse.json({ durationMin: job.quote.durationMin, slots: availability(db, body.date, job.quote.durationMin) });
});
