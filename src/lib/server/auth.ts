import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { getDb } from './db';
import { HttpError } from './http';

export type Role = 'customer' | 'cleaner' | 'admin';

export interface SessionUser {
  id: number;
  role: Role;
  name: string;
  email: string;
  phone: string;
}

export const SESSION_COOKIE = 'ps_session';

// Staff sessions are shorter: a forgotten logged-in admin tab is the bigger risk.
const SESSION_TTL_MS: Record<Role, number> = {
  customer: 30 * 24 * 60 * 60 * 1000,
  cleaner: 7 * 24 * 60 * 60 * 1000,
  admin: 12 * 60 * 60 * 1000,
};

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export async function startSession(user: { id: number; role: Role }) {
  const token = randomBytes(32).toString('base64url');
  const ttl = SESSION_TTL_MS[user.role];
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha256(token), user.id, Date.now() + ttl);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(ttl / 1000),
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) getDb().prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
  jar.delete(SESSION_COOKIE);
}

export function endAllSessionsFor(userId: number) {
  getDb().prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.role, u.name, u.email, u.phone
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1`,
    )
    .get(sha256(token), Date.now()) as SessionUser | undefined;
  return row ? { ...row } : null;
}

/** Throws 401 if logged out, 403 if logged in with the wrong role. */
export async function requireUser(...roles: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, 'Please log in to continue.');
  if (roles.length && !roles.includes(user.role)) throw new HttpError(403, 'You do not have access to this.');
  return user;
}
