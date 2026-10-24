import { NextResponse, type NextRequest } from 'next/server';

// Fast "are you logged in at all?" redirect for the private areas, so people
// land on the right login page. This is only a convenience: every API route
// checks the session and role itself, so skipping this proxy grants nothing.

const SESSION_COOKIE = 'ps_session';

const AREAS: { prefix: string; login: string }[] = [
  { prefix: '/account', login: '/login' },
  { prefix: '/cleaner', login: '/cleaner/login' },
  { prefix: '/admin', login: '/admin/login' },
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const area = AREAS.find((a) => pathname === a.prefix || pathname.startsWith(`${a.prefix}/`));
  if (!area || pathname === area.login) return NextResponse.next();

  if (!req.cookies.get(SESSION_COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = area.login;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/cleaner/:path*', '/admin/:path*'],
};
