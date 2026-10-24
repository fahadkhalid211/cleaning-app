import { NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/server/accounts';
import { clientIp, rateLimit, readJson, route } from '@/lib/server/http';

export const POST = route(async (req) => {
  rateLimit(`register:${clientIp(req)}`, 10, 60 * 60 * 1000);
  const body = await readJson(req);
  await registerCustomer(body);
  return NextResponse.json({ ok: true });
});
