import { NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { startSession, type Role } from '@/lib/server/auth';
import { clearRateLimit, clientIp, HttpError, rateLimit, readJson, route } from '@/lib/server/http';
import { DUMMY_HASH, verifyPassword } from '@/lib/server/passwords';
import * as v from '@/lib/server/validate';

const PORTALS: readonly Role[] = ['customer', 'cleaner', 'admin'];
const WINDOW = 15 * 60 * 1000;

export const POST = route(async (req) => {
  const body = await readJson(req);
  const portal = v.oneOf(body.portal, PORTALS, 'portal', 'a portal');
  const email = v.email(body.email);
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';

  rateLimit(`login-ip:${clientIp(req)}`, 30, WINDOW);
  const emailKey = `login-email:${portal}:${email}`;
  rateLimit(emailKey, 6, WINDOW);

  const user = getDb()
    .prepare('SELECT id, role, password_hash, active FROM users WHERE email = ?')
    .get(email) as { id: number; role: Role; password_hash: string; active: number } | undefined;

  // Always run the hash so response time doesn't reveal whether the email exists.
  const ok = verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok || user.active !== 1 || user.role !== portal) {
    throw new HttpError(401, 'That email and password do not match. Please check and try again.');
  }

  clearRateLimit(emailKey);
  await startSession(user);
  return NextResponse.json({ ok: true, role: user.role });
});
