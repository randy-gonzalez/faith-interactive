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

    // Cache headers for public pages
    const publicCacheHeaders = [
      ...securityHeaders,
      { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" },
    ];

    // Cache headers for private/admin pages
    const privateCacheHeaders = [
      ...securityHeaders,
      { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
    ];

    return [
      // ============================================
      // Public church website routes - cacheable
      // ============================================
      {
        source: "/",
        headers: publicCacheHeaders,
      },
      {
        source: "/sermons",
        headers: publicCacheHeaders,
      },
      {
        source: "/sermons/:id",
        headers: publicCacheHeaders,
      },
      {
        source: "/events",
        headers: publicCacheHeaders,
      },
      {
        source: "/events/:id",
        headers: publicCacheHeaders,
      },
      {
        source: "/staff",
        headers: publicCacheHeaders,
      },
      {
        source: "/contact",
        headers: publicCacheHeaders,
      },
      {
        source: "/p/:slug",
        headers: publicCacheHeaders,
      },

      // ============================================
      // Admin routes - no caching
      // ============================================
      {
        source: "/admin",
        headers: privateCacheHeaders,
      },
      {
        source: "/admin/:path*",
        headers: privateCacheHeaders,
      },

      // ============================================
      // Auth routes - no caching
      // ============================================
      {
        source: "/login",
        headers: privateCacheHeaders,
      },
      {
        source: "/forgot-password",
        headers: privateCacheHeaders,
      },
      {
        source: "/reset-password",
        headers: privateCacheHeaders,
      },
      {
        source: "/accept-invite",
        headers: privateCacheHeaders,
      },

      // ============================================
      // API routes - no caching
      // ============================================
      {
        source: "/api/:path*",
        headers: privateCacheHeaders,
      },

      // ============================================
      // All other routes - apply security headers only
      // ============================================
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
