import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { listForAdmin } from '@/lib/server/bookings';
import { getDb } from '@/lib/server/db';
import { route } from '@/lib/server/http';
import { isValidDate } from '@/lib/dates';

const STATUSES = ['confirmed', 'on_the_way', 'in_progress', 'completed', 'cancelled'];

export const GET = route(async (req) => {
  await requireUser('admin');
  const p = new URL(req.url).searchParams;
  const from = p.get('from');
  const to = p.get('to');
  const status = p.get('status');
  const q = p.get('q')?.slice(0, 60).trim();
  const db = getDb();
  return NextResponse.json({
    bookings: listForAdmin(db, {
      from: isValidDate(from) ? from : undefined,
      to: isValidDate(to) ? to : undefined,
      status: status && STATUSES.includes(status) ? status : undefined,
      q: q || undefined,
    }),
    cleaners: db.prepare("SELECT id, name FROM users WHERE role = 'cleaner' AND active = 1 ORDER BY name").all(),
  });
});
