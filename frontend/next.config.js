/** @type {import('next').NextConfig} */
const nextConfig = {
  // In Docker, browser requests still hit the host-mapped port (localhost:8000)
  // so no proxy rewrite is needed. Server-side fetch calls use INTERNAL_API_URL
  // (http://backend:8000) via the Docker network — set that in your fetch helpers.

  // Required for Next.js to trust the reverse-proxy headers in production.
  // Harmless in development.
  poweredByHeader: false,
};

module.exports = nextConfig;
