import { NextResponse } from 'next/server';
import { registerCleaner } from '@/lib/server/accounts';
import { clientIp, rateLimit, readJson, route } from '@/lib/server/http';

export const POST = route(async (req) => {
  rateLimit(`register-cleaner:${clientIp(req)}`, 10, 60 * 60 * 1000);
  const body = await readJson(req);
  await registerCleaner(body);
  return NextResponse.json({ ok: true, role: 'cleaner' });
});
