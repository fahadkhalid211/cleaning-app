import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { audit, getDb } from '@/lib/server/db';
import { HttpError, readJson, route } from '@/lib/server/http';
import * as v from '@/lib/server/validate';

export const PATCH = route<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const admin = await requireUser('admin');
  const { id } = await params;
  const db = getDb();
  if (!db.prepare('SELECT id FROM addons WHERE id = ?').get(id)) throw new HttpError(404, 'Extra not found.');
  const body = await readJson(req);
  const price = v.money(body.price, 'price', 'Price', 0, 500);
  const durationMin = v.int(body.durationMin, 'durationMin', 'Minutes', 0, 240);
  const active = body.active === false ? 0 : 1;
  db.prepare('UPDATE addons SET price = ?, duration_min = ?, active = ? WHERE id = ?').run(price, durationMin, active, id);
  audit(admin.id, 'admin.addon.update', `${id} price=${price} mins=${durationMin} active=${active}`);
  return NextResponse.json({ ok: true });
});
