import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { route } from '@/lib/server/http';
import { nowInBusinessTz } from '@/lib/dates';

export const GET = route(async () => {
  await requireUser('admin');
  const db = getDb();
  const today = nowInBusinessTz().date;
  const month = today.slice(0, 7);
  const count = (sql: string, ...p: string[]) => (db.prepare(sql).get(...p) as { n: number }).n;
  return NextResponse.json({
    today,
    jobsToday: count("SELECT COUNT(*) AS n FROM bookings WHERE date = ? AND status <> 'cancelled'", today),
    upcoming: count("SELECT COUNT(*) AS n FROM bookings WHERE date > ? AND status = 'confirmed'", today),
    revenueMonth: count("SELECT COALESCE(SUM(total), 0) AS n FROM bookings WHERE substr(date, 1, 7) = ? AND status <> 'cancelled'", month),
    activeCleaners: count("SELECT COUNT(*) AS n FROM users WHERE role = 'cleaner' AND active = 1"),
    customers: count("SELECT COUNT(*) AS n FROM users WHERE role = 'customer'"),
    recent: db.prepare('SELECT at, action, details FROM audit_log ORDER BY id DESC LIMIT 15').all(),
  });
});
