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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    // Default: never serve stale data for this platform.
    // Individual callers can pass { next: { revalidate: N } } to opt into ISR.
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

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

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),

  put: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: 'DELETE', ...options }),
};
