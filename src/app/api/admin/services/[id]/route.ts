import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { audit, getDb } from '@/lib/server/db';
import { HttpError, readJson, route } from '@/lib/server/http';
import * as v from '@/lib/server/validate';

export const PATCH = route<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const admin = await requireUser('admin');
  const { id } = await params;
  const db = getDb();
  if (!db.prepare('SELECT id FROM services WHERE id = ?').get(id)) throw new HttpError(404, 'Service not found.');
  const body = await readJson(req);
  const hourlyRate = v.money(body.hourlyRate, 'hourlyRate', 'Hourly rate', 5, 500);
  const minHours = v.money(body.minHours, 'minHours', 'Minimum hours', 1, 10);
  const active = body.active === false ? 0 : 1;
  if (active === 0) {
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM services WHERE active = 1 AND id <> ?').get(id) as { n: number };
    if (n === 0) throw new HttpError(409, 'At least one service must stay available.');
  }
  db.prepare('UPDATE services SET hourly_rate = ?, min_hours = ?, active = ? WHERE id = ?').run(hourlyRate, minHours, active, id);
  audit(admin.id, 'admin.service.update', `${id} rate=${hourlyRate} min=${minHours} active=${active}`);
  return NextResponse.json({ ok: true });
});
