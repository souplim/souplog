import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pins the workspace root explicitly — otherwise Turbopack walks up and
  // trips on an unrelated lockfile in the user's home directory.
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    serverActions: {
      // Photos and attachments ride along in the post form's Server Action,
      // whose body is capped at 1MB by default — too small for one attached PDF.
      bodySizeLimit: '20mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        // The site opens on the owner's introduction; the post feed lives at /posts.
        // Temporary, so browsers don't cache it if the home page changes again.
        source: '/',
        destination: '/about',
        permanent: false,
      },
      {
        // Menu pages moved under /posts; keeps links shared before the move working.
        source: '/menu/:slug',
        destination: '/posts/menu/:slug',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Content-Security-Policy is set per-request in proxy.ts (it needs a fresh nonce).
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default nextConfig;
