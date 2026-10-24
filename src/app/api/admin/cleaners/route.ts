import { NextResponse } from 'next/server';
import { createCleaner } from '@/lib/server/accounts';
import { requireUser } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { readJson, route } from '@/lib/server/http';
import { nowInBusinessTz } from '@/lib/dates';

export const GET = route(async () => {
  await requireUser('admin');
  const today = nowInBusinessTz().date;
  const cleaners = getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.phone, u.active, u.created_at AS createdAt,
              (SELECT COUNT(*) FROM bookings b WHERE b.cleaner_id = u.id AND b.date >= ? AND b.status IN ('confirmed','on_the_way','in_progress')) AS upcoming,
              (SELECT COUNT(*) FROM bookings b WHERE b.cleaner_id = u.id AND b.status = 'completed') AS completed
         FROM users u WHERE u.role = 'cleaner' ORDER BY u.active DESC, u.name`,
    )
    .all(today);
  return NextResponse.json({ cleaners });
});

export const POST = route(async (req) => {
  const admin = await requireUser('admin');
  const id = createCleaner(admin.id, await readJson(req));
  return NextResponse.json({ id }, { status: 201 });
});
