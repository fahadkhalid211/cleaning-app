import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'hd_session';

const SUPPORTED_LOCALES = ['en', 'cn'] as const;
const DEFAULT_LOCALE = 'en';

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1. Bypass internal and static assets
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Extract locale if present: /en/... or /cn/...
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  const hasLocale = (SUPPORTED_LOCALES as readonly string[]).includes(firstSegment);
  const currentLocale = hasLocale ? firstSegment : DEFAULT_LOCALE;

  // 3. Handle un-prefixed public site paths: redirect to /en/...
  // (exclude /cleaner and /admin which are staff portals)
  if (!hasLocale && !pathname.startsWith('/cleaner') && !pathname.startsWith('/admin')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === '/' ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 4. Session authentication guards
  // Localized /account route check
  const isAccountPath =
    pathname === '/account' ||
    pathname.startsWith('/account/') ||
    pathname === `/${currentLocale}/account` ||
    pathname.startsWith(`/${currentLocale}/account/`);

  if (isAccountPath) {
    if (!req.cookies.get(SESSION_COOKIE)?.value) {
      const url = req.nextUrl.clone();
      url.pathname = `/${currentLocale}/login`;
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }

  // Staff accommodation (hostel) is for logged-in cleaners only
  const isHostelPath = pathname === `/${currentLocale}/hostel` || pathname.startsWith(`/${currentLocale}/hostel/`);
  if (isHostelPath && !req.cookies.get(SESSION_COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = '/cleaner/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // Cleaner & Admin portals auth check
  if (pathname.startsWith('/cleaner') && pathname !== '/cleaner/login' && pathname !== '/cleaner/signup') {
    if (!req.cookies.get(SESSION_COOKIE)?.value) {
      const url = req.nextUrl.clone();
      url.pathname = '/cleaner/login';
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!req.cookies.get(SESSION_COOKIE)?.value) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all except api, _next static/image, and static files with extensions
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\..*).*)',
  ],
};
