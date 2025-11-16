import type { NextConfig } from 'next';

const devOrigin = process.env.NEXT_PUBLIC_DEV_ORIGIN || '';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: devOrigin ? [devOrigin] : [],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
    qualities: [75, 85, 90, 100],
  },
  // Rewrites removed - now using Route Handlers in /app/api
  // This prevents ROUTER_EXTERNAL_TARGET_HANDSHAKE_ERROR on Vercel
  // See: /app/api/[...path]/route.ts for API proxy implementation
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
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://images.unsplash.com https://plus.unsplash.com",
              "font-src 'self'",
              // connect-src 'self' is sufficient because Route Handlers proxy external APIs server-side
              "connect-src 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
            ].join('; '),
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
            value: [
              "default-src 'self'",
              "script-src 'self'",
              "img-src 'self' data:",
              "connect-src 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
