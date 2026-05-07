// In Docker, RSC (server-side) fetches must use the internal service name.
// Browser (client component) fetches use the public-facing URL.
//
// docker-compose exports both:
//   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1   (browser)
//   INTERNAL_API_URL=http://backend:8000/api/v1        (server, Docker network)
const isBrowser = typeof window !== 'undefined';

const API_BASE_URL = isBrowser
  ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1')
  : (process.env.INTERNAL_API_URL
      ?? process.env.API_URL
      ?? process.env.NEXT_PUBLIC_API_URL
      ?? 'http://localhost:8000/api/v1');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Internal options forwarded to fetch.
 * - `headers`: extra headers (e.g. Cookie when called from a Server Component).
 * - `cache` / `next`: standard Next.js fetch options.
 * - `skipCredentials`: rare opt-out for endpoints that should NOT send cookies.
 */
type RequestOptions = RequestInit & { skipCredentials?: boolean };

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const { skipCredentials, ...rest } = options ?? {};

  const init: RequestInit = {
    // Default: never serve stale data for this platform.
    // Individual callers can pass { next: { revalidate: N } } to opt into ISR.
    cache: 'no-store',
    // Browser: always include cookies on cross-origin XHR so HttpOnly auth
    // cookies travel with the request. Server-side callers pass an explicit
    // Cookie header when they need to forward the user's session.
    credentials: skipCredentials ? 'omit' : 'include',
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers,
    },
    ...rest,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, init);

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
      // ignore json parse errors on error responses
    }
    throw new ApiError(res.status, res.statusText, detail);
  }

  // 204 No Content — return undefined as T
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),

  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...options }),
};
