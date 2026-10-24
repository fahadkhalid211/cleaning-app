import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { route } from '@/lib/server/http';

export const GET = route(async (req) => {
  await requireUser('admin');
  const q = new URL(req.url).searchParams.get('q')?.slice(0, 60).replace(/[%_]/g, '').trim() ?? '';
  const like = `%${q}%`;
  const customers = getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.phone, u.created_at AS createdAt,
              COUNT(b.id) AS bookings, COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total END), 0) AS spent
         FROM users u LEFT JOIN bookings b ON b.customer_id = u.id
        WHERE u.role = 'customer' AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)
        GROUP BY u.id ORDER BY u.created_at DESC LIMIT 500`,
    )
    .all(like, like, like);
  return NextResponse.json({ customers });
});
