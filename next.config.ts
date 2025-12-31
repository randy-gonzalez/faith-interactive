import type { NextConfig } from "next";

/**
 * Next.js Configuration for Faith Interactive
 *
 * Security headers are configured here to work with Cloudflare CDN.
 * SSL/HTTPS is handled by Cloudflare, so we don't configure it here.
 */
const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Security headers - these work alongside Cloudflare's security features
  async headers() {
    // Common security headers applied to all routes
    const securityHeaders = [
      // Prevent clickjacking attacks
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      // Prevent MIME type sniffing
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Control referrer information
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // XSS protection (legacy, but still useful for older browsers)
      { key: "X-XSS-Protection", value: "1; mode=block" },
      // DNS prefetch control
      { key: "X-DNS-Prefetch-Control", value: "on" },
      // CSP - allows YouTube, Vimeo, Google Maps embeds
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "connect-src 'self'",
          "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.google.com https://maps.google.com",
          "media-src 'self' https:",
        ].join("; "),
      },
    ];

    return [
      // Public website routes - cacheable by CDN
      {
        source: "/",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/sermons",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/sermons/:id",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/events",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/events/:id",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/staff",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/contact",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/p/:slug",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
        ],
      },
      // Dashboard routes - no caching
      {
        source: "/dashboard",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/manage-sermons",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/manage-sermons/:id",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/manage-events",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/manage-events/:id",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/pages",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/pages/:id",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/settings",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/team",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      // API routes - no caching by default
      {
        source: "/api/:path",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
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

  // Configure for CDN caching compatibility
  // Static assets are cached, dynamic routes are not
  experimental: {
    // Enable server actions for form handling
  },
};

export default nextConfig;
