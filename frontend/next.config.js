/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/* from the Next.js dev server straight to FastAPI.
  // This lets browser fetch calls use relative URLs (/api/v1/...) and
  // avoids CORS issues for client-side requests during development.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
