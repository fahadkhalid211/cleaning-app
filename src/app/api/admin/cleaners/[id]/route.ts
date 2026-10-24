import { NextResponse } from 'next/server';
import { endAllSessionsFor, requireUser } from '@/lib/server/auth';
import { audit, getDb } from '@/lib/server/db';
import { HttpError, readJson, route } from '@/lib/server/http';
import { hashPassword } from '@/lib/server/passwords';
import * as v from '@/lib/server/validate';
import { nowInBusinessTz } from '@/lib/dates';

export const PATCH = route<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const admin = await requireUser('admin');
  const id = Number((await params).id);
  const db = getDb();
  const cleaner = Number.isInteger(id) ? db.prepare("SELECT id FROM users WHERE id = ? AND role = 'cleaner'").get(id) : undefined;
  if (!cleaner) throw new HttpError(404, 'Cleaner not found.');
  const body = await readJson(req);

  if (body.active === false) {
    const { n } = db
      .prepare("SELECT COUNT(*) AS n FROM bookings WHERE cleaner_id = ? AND date >= ? AND status IN ('confirmed','on_the_way','in_progress')")
      .get(id, nowInBusinessTz().date) as { n: number };
    if (n > 0) throw new HttpError(409, `This cleaner still has ${n} upcoming job${n === 1 ? '' : 's'}. Re-assign them in Bookings first.`);
    db.prepare('UPDATE users SET active = 0 WHERE id = ?').run(id);
    endAllSessionsFor(id);
    audit(admin.id, 'admin.cleaner.deactivate', String(id));
  } else if (body.active === true) {
    db.prepare('UPDATE users SET active = 1 WHERE id = ?').run(id);
    audit(admin.id, 'admin.cleaner.activate', String(id));
  }

  if (body.password !== undefined) {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(v.password(body.password)), id);
    endAllSessionsFor(id);
    audit(admin.id, 'admin.cleaner.password', String(id));
  }
  return NextResponse.json({ ok: true });
});
