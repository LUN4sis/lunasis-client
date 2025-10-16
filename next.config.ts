import type { NextConfig } from 'next';

const devOrigin = process.env.NEXT_PUBLIC_DEV_ORIGIN || '';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: devOrigin ? [devOrigin] : [],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
      {
        source: '/login/oauth2/:path*',
        destination: `${apiUrl}/login/oauth2/:path*`,
      },
      {
        source: '/oauth2/:path*',
        destination: `${apiUrl}/oauth2/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; frame-ancestors 'none';",
          },
          {
            key: 'Permissions-Policy',
            value: devOrigin
              ? `camera=(), microphone=(), geolocation=(self "${devOrigin}")`
              : 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
