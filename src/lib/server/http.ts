import 'server-only';
import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(public status: number, message: string, public field?: string) {
    super(message);
  }
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response> | Response;

/** Wraps a route handler: same-origin check on writes, clean JSON errors, no stack traces leaked. */
export function route<C = unknown>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') assertSameOrigin(req);
      const res = await fn(req, ctx);
      res.headers.set('Cache-Control', 'no-store');
      return res;
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message, field: err.field }, { status: err.status, headers: { 'Cache-Control': 'no-store' } });
      }
      // Next uses thrown errors for control flow (e.g. dynamic rendering bailouts) — let those through.
      if (err && typeof err === 'object' && 'digest' in err) throw err;
      console.error('[api]', req.method, new URL(req.url).pathname, err);
      return NextResponse.json({ error: 'Something went wrong on our side. Please try again.' }, { status: 500 });
    }
  };
}

/**
 * CSRF guard. Browsers always send Origin on cross-site POST/PATCH/DELETE;
 * if it doesn't match our host the request came from another website.
 */
function assertSameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return;
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, 'Request blocked.');
  }
  if (!host || originHost !== host) throw new HttpError(403, 'Request blocked.');
}

export async function readJson(req: Request, maxBytes = 16 * 1024): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, 'Request is too large.');
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'Invalid request.');
  }
}

// Anyone can send a fake X-Forwarded-For, but each proxy in front of us appends
// the address it really saw. So we count back from the right by the number of
// proxies we trust (Hostinger: 1) and ignore everything the client wrote.
const PROXY_HOPS = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS) || 1);

export function clientIp(req: Request): string {
  const chain = (req.headers.get('x-forwarded-for') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return chain[Math.max(0, chain.length - PROXY_HOPS)] || req.headers.get('x-real-ip') || 'unknown';
}

// Simple fixed-window limiter, in memory. Enough for a single Node process.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 10_000) for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  b.count += 1;
  if (b.count > limit) {
    const mins = Math.ceil((b.resetAt - now) / 60_000);
    throw new HttpError(429, `Too many attempts. Please wait ${mins} minute${mins === 1 ? '' : 's'} and try again.`);
  }
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}
