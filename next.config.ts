import type { NextConfig } from "next";

/**
 * Next.js Configuration for Faith Interactive Marketing Site
 *
 * Deployed on Vercel with full Next.js optimization support.
 */
const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Security headers
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: https:",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self'",
          "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.google.com https://maps.google.com",
          "media-src 'self' https:",
        ].join("; "),
      },
    ];

    const publicCacheHeaders = [
      ...securityHeaders,
      { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
    ];

    const privateCacheHeaders = [
      ...securityHeaders,
      { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
    ];

    return [
      // Marketing pages - cacheable
      {
        source: "/",
        headers: publicCacheHeaders,
      },
      {
        source: "/about",
        headers: publicCacheHeaders,
      },
      {
        source: "/pricing",
        headers: publicCacheHeaders,
      },
      {
        source: "/services",
        headers: publicCacheHeaders,
      },
      {
        source: "/services/:slug",
        headers: publicCacheHeaders,
      },
      {
        source: "/work",
        headers: publicCacheHeaders,
      },
      {
        source: "/work/:slug",
        headers: publicCacheHeaders,
      },
      {
        source: "/trends",
        headers: publicCacheHeaders,
      },
      {
        source: "/trends/:slug",
        headers: publicCacheHeaders,
      },
      {
        source: "/contact",
        headers: publicCacheHeaders,
      },
      {
        source: "/faq",
        headers: publicCacheHeaders,
      },

      // API routes - no caching
      {
        source: "/api/:path*",
        headers: privateCacheHeaders,
      },

      // All other routes - apply security headers
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,
};

export default nextConfig;
