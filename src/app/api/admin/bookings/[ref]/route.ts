import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { updateByAdmin } from '@/lib/server/bookings';
import { readJson, route } from '@/lib/server/http';

export const PATCH = route<{ params: Promise<{ ref: string }> }>(async (req, { params }) => {
  const admin = await requireUser('admin');
  const { ref } = await params;
  updateByAdmin(admin.id, ref, await readJson(req));
  return NextResponse.json({ ok: true });
});
