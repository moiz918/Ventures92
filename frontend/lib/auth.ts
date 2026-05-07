/**
 * Server-side authentication helpers for Next.js App Router.
 *
 * Used by:
 *  - Server Components / RSC pages (admin layout, admin pages)
 *  - Route handlers (rare — most calls are client-side via the cookies)
 *
 * IMPORTANT: This module MUST NOT be imported from middleware.ts because
 * middleware runs in the Edge runtime (no Node `cookies()` API). Middleware
 * has its own logic in `frontend/middleware.ts`.
 */
import { cookies } from 'next/headers';

import { ApiError } from '@/services/api';
import { ADMIN_ROLES, type CurrentUser, me } from '@/services/authService';

const ACCESS_COOKIE = 'v92_access';
const REFRESH_COOKIE = 'v92_refresh';

/**
 * Build a `Cookie:` header from the incoming Next request and forward it to
 * the backend so /auth/me can validate the session server-side. This is the
 * canonical way to bridge browser cookies → server-side fetches inside the
 * Next App Router.
 */
async function forwardedCookieHeader(): Promise<string | null> {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const refresh = jar.get(REFRESH_COOKIE)?.value;

  const parts: string[] = [];
  if (access) parts.push(`${ACCESS_COOKIE}=${access}`);
  if (refresh) parts.push(`${REFRESH_COOKIE}=${refresh}`);

  return parts.length ? parts.join('; ') : null;
}

/**
 * Returns the authenticated user, or null if no valid session exists.
 * Errors other than 401 propagate so genuine backend issues are not silenced.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieHeader = await forwardedCookieHeader();
  if (!cookieHeader) return null;

  try {
    return await me({ Cookie: cookieHeader });
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return null;
    }
    throw err;
  }
}

/** True iff the user is signed in and holds an admin-grade role. */
export async function getAdminUserOrNull(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return ADMIN_ROLES.has(user.role) ? user : null;
}
