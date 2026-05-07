/**
 * Edge middleware — gate-keeper for /admin/*.
 *
 * Three outcomes:
 *  1. Access cookie present  → pass through. The admin layout still validates
 *                              the role server-side via /auth/me.
 *  2. Only refresh present   → call /auth/refresh server-to-server, forward
 *                              the new Set-Cookie headers to the browser, and
 *                              continue rendering the page.
 *  3. Both cookies missing   → 302 to /login?next=<original-path>.
 *
 * Note: this runs in the Edge runtime; we cannot import the Node `cookies()`
 * API. We must use `request.cookies.get()` and `NextResponse.next()`.
 */
import { NextResponse, type NextRequest } from 'next/server';

const ACCESS_COOKIE = 'v92_access';
const REFRESH_COOKIE = 'v92_refresh';

const PROTECTED_PREFIXES = ['/admin'] as const;

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function redirectToLogin(req: NextRequest, reason: 'unauth' | 'expired'): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', req.nextUrl.pathname + (req.nextUrl.search || ''));
  if (reason === 'expired') url.searchParams.set('expired', '1');
  const res = NextResponse.redirect(url);
  // Defence in depth — wipe any stale auth cookies on the redirect
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}

async function tryRefresh(refreshToken: string): Promise<Headers | null> {
  // Middleware runs server-side inside the Next container; use the internal
  // Docker URL so the request never leaves the network.
  const apiUrl =
    process.env.INTERNAL_API_URL ??
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://backend:8000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${REFRESH_COOKIE}=${refreshToken}`,
      },
      body: '{}',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.headers;
  } catch {
    return null;
  }
}

function forwardSetCookies(source: Headers, target: NextResponse): void {
  // `Headers.getSetCookie()` is supported on modern runtimes (Node 20+, Edge).
  // Fall back to a single `set-cookie` header if the helper is missing.
  const list =
    typeof (source as Headers & { getSetCookie?: () => string[] }).getSetCookie === 'function'
      ? (source as unknown as { getSetCookie: () => string[] }).getSetCookie()
      : (source.get('set-cookie') ? [source.get('set-cookie') as string] : []);

  for (const cookie of list) {
    target.headers.append('Set-Cookie', cookie);
  }
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  if (!isProtected(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  // Path 1 — fully signed in. Role enforcement happens in the admin layout.
  if (access) {
    return NextResponse.next();
  }

  // Path 3 — no session at all.
  if (!refresh) {
    return redirectToLogin(req, 'unauth');
  }

  // Path 2 — refresh-only. Attempt silent rotation.
  const refreshHeaders = await tryRefresh(refresh);
  if (!refreshHeaders) {
    return redirectToLogin(req, 'expired');
  }

  const passthrough = NextResponse.next();
  forwardSetCookies(refreshHeaders, passthrough);
  return passthrough;
}

export const config = {
  // Apply to every /admin path (incl. nested) — but not to static assets.
  matcher: ['/admin/:path*'],
};
