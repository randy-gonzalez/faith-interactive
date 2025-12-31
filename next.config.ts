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
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          // Prevent clickjacking attacks
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // XSS protection (legacy, but still useful for older browsers)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // DNS prefetch control
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // Basic CSP - intentionally permissive for Phase 0
          // TODO: Tighten CSP as the application matures
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
          },
        ],
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
