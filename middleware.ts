/**
 * Next.js Middleware
 *
 * This middleware runs on every request and handles:
 * 1. Hostname-based routing (marketing vs church subdomain vs custom domain)
 * 2. Custom domain resolution (preferred) → subdomain extraction → tenant resolution
 * 3. Redirect rules for tenant public routes
 * 4. Maintenance mode check
 * 5. Authentication checks for protected routes (/admin/*)
 * 6. Rate limiting (foundation)
 *
 * Route Structure:
 * - Main domain (faithinteractive.com) → Marketing site (marketing)
 * - Subdomain (grace.faithinteractive.com) → Church site (church) + Admin (/admin/*)
 * - Custom domain (www.gracechurch.org) → Church site (church) + Admin (/admin/*)
 *
 * Tenant Resolution Priority:
 * 1. Custom domain lookup (active domains only)
 * 2. Subdomain extraction
 *
 * IMPORTANT: This runs on the Edge runtime, so we can't use
 * Prisma directly. We use fetch to call internal API routes
 * for database operations.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Headers used to pass tenant context to the application
const TENANT_HEADER_ID = "x-church-id";
const TENANT_HEADER_SLUG = "x-church-slug";
const TENANT_HEADER_NAME = "x-church-name";
const TENANT_HEADER_CUSTOM_DOMAIN = "x-custom-domain"; // Set when resolved via custom domain

// Request ID header for correlation (Phase 5)
const REQUEST_ID_HEADER = "x-request-id";

// Session cookie name
const SESSION_COOKIE_NAME = "fi_session";

// Routes that don't require authentication (on subdomains)
const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/accept-invite",
  "/api/auth/login",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/accept-invite",
  "/api/health",
  "/api/contact",
];

// Routes that don't require tenant context (global routes)
const GLOBAL_ROUTES = [
  "/api/health",
  "/api/internal/resolve-domain", // Custom domain resolution for middleware
  "/api/internal/check-redirect", // Redirect rule checking for middleware
  "/api/internal/check-maintenance", // Maintenance mode checking for middleware
];

// Known localhost patterns for development
const LOCALHOST_PATTERNS = [
  "localhost",
  "127.0.0.1",
  "::1",
];

/**
 * Simple in-memory rate limiting for Edge runtime.
 * Note: This resets on deployment and isn't shared across regions.
 * For production, consider using a KV store or Redis.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const max = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);
  const windowSeconds = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || "60", 10);
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const existing = rateLimitMap.get(ip);

  if (!existing || existing.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  existing.count++;
  const allowed = existing.count <= max;
  return { allowed, remaining: Math.max(0, max - existing.count) };
}

/**
 * Extract subdomain from hostname.
 *
 * Examples:
 * - grace.faithinteractive.com → "grace"
 * - demo.localhost:3000 → "demo"
 * - localhost:3000 → null (no subdomain)
 * - faithinteractive.com → null (no subdomain)
 */
function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(":")[0];

  // Handle localhost development
  for (const localhost of LOCALHOST_PATTERNS) {
    if (host.endsWith(`.${localhost}`)) {
      const subdomain = host.replace(`.${localhost}`, "");
      return subdomain || null;
    }
    if (host === localhost) {
      return null;
    }
  }

  // Handle production domains (e.g., grace.faithinteractive.com)
  const parts = host.split(".");

  // Expect format: subdomain.domain.tld (at least 3 parts)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Ignore "www" as a subdomain
    if (subdomain.toLowerCase() === "www") {
      return null;
    }
    return subdomain;
  }

  return null;
}

/**
 * Check if a route requires authentication (admin routes)
 */
function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

/**
 * Check if a route is a public auth route (login, etc.)
 */
function isPublicAuthRoute(pathname: string): boolean {
  return PUBLIC_AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a route is global (doesn't require tenant context)
 */
function isGlobalRoute(pathname: string): boolean {
  return GLOBAL_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a route is a public-facing route (not admin, not API, not auth)
 */
function isPublicRoute(pathname: string): boolean {
  return (
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/forgot-password") &&
    !pathname.startsWith("/reset-password") &&
    !pathname.startsWith("/accept-invite")
  );
}

/**
 * Check if a hostname is likely a custom domain (not our main domain or subdomain).
 * Returns true if hostname doesn't match known patterns.
 */
function isPotentialCustomDomain(hostname: string): boolean {
  const host = hostname.split(":")[0].toLowerCase();

  // Known main domains
  const mainDomains = ["faithinteractive.com", "faithinteractive.test"];

  // Check if it's a localhost pattern
  for (const localhost of LOCALHOST_PATTERNS) {
    if (host === localhost || host.endsWith(`.${localhost}`)) {
      return false;
    }
  }

  // Check if it's our main domain or a subdomain of it
  for (const domain of mainDomains) {
    if (host === domain || host === `www.${domain}` || host.endsWith(`.${domain}`)) {
      return false;
    }
  }

  // Otherwise, it might be a custom domain
  return true;
}

/**
 * Get client IP from request headers
 */
function getClientIp(request: NextRequest): string {
  // Try various headers (Cloudflare, proxies, etc.)
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  return "unknown";
}

/**
 * Generate a unique request ID for correlation (Phase 5)
 * Format: req_<timestamp>_<random>
 * Uses an existing request ID if provided by upstream (e.g., Cloudflare)
 */
function getOrGenerateRequestId(request: NextRequest): string {
  // Check for existing request ID from upstream (Cloudflare, load balancer, etc.)
  const existingId = request.headers.get(REQUEST_ID_HEADER) ||
                     request.headers.get("cf-ray"); // Cloudflare Ray ID
  if (existingId) return existingId;

  // Generate a new request ID
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `req_${timestamp}_${random}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // Files with extensions (images, etc.)
  ) {
    return NextResponse.next();
  }

  // Generate request ID for correlation (Phase 5)
  const requestId = getOrGenerateRequestId(request);

  // Rate limiting check
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(clientIp);

  if (!rateLimitResult.allowed) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
        "X-RateLimit-Remaining": "0",
        [REQUEST_ID_HEADER]: requestId,
      },
    });
  }

  // Global routes don't need tenant context
  if (isGlobalRoute(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(REQUEST_ID_HEADER, requestId);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  // Tenant Resolution Priority:
  // 1. Custom domain lookup (for potential custom domains)
  // 2. Subdomain extraction
  let tenantSlug: string | null = null;
  let isCustomDomain = false;
  let customDomainHostname: string | null = null;

  // Check if this might be a custom domain
  if (isPotentialCustomDomain(hostname)) {
    // Try to resolve custom domain via internal API
    // Note: This API call is cached and optimized for Edge
    try {
      const normalizedHost = hostname.split(":")[0].toLowerCase();
      const resolveUrl = new URL("/api/internal/resolve-domain", request.url);
      resolveUrl.searchParams.set("hostname", normalizedHost);

      const response = await fetch(resolveUrl.toString(), {
        headers: {
          "x-internal-request": "1",
        },
        // Cache for 5 minutes to reduce DB load
        next: { revalidate: 300 },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.churchSlug) {
          tenantSlug = data.churchSlug;
          isCustomDomain = true;
          customDomainHostname = normalizedHost;
        }
      }
    } catch (error) {
      // Custom domain lookup failed, continue with subdomain extraction
      console.error("Custom domain resolution failed:", error);
    }
  }

  // Fall back to subdomain extraction if custom domain didn't match
  if (!tenantSlug) {
    tenantSlug = extractSubdomain(hostname);
  }

  // No tenant = main domain = marketing site
  if (!tenantSlug) {
    // Check if this was an unrecognized custom domain
    if (isPotentialCustomDomain(hostname)) {
      // Log unrecognized domain for observability
      console.warn(`Unrecognized hostname: ${hostname}`);
      // Could redirect to main site or show an error page
      const mainSiteUrl = new URL("/", request.url);
      mainSiteUrl.host = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "faithinteractive.com";
      // For now, just continue to marketing site
    }

    // Marketing site routes - rewrite to (marketing) route group
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(REQUEST_ID_HEADER, requestId);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("x-site-type", "marketing");
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  // Has tenant = church site

  // Check for redirect rules on public routes
  // Skip redirects for admin, API, and auth routes
  if (isPublicRoute(pathname)) {
    try {
      const redirectUrl = new URL("/api/internal/check-redirect", request.url);
      redirectUrl.searchParams.set("churchSlug", tenantSlug);
      redirectUrl.searchParams.set("path", pathname);

      const redirectResponse = await fetch(redirectUrl.toString(), {
        headers: { "x-internal-request": "1" },
        next: { revalidate: 60 }, // Cache for 1 minute
      });

      if (redirectResponse.ok) {
        const redirectData = await redirectResponse.json();
        if (redirectData.redirect?.destinationUrl) {
          // Build the redirect URL
          let targetUrl: string;
          if (redirectData.redirect.destinationUrl.startsWith("/")) {
            // Relative path - keep on same host
            targetUrl = new URL(redirectData.redirect.destinationUrl, request.url).toString();
          } else {
            // Absolute URL
            targetUrl = redirectData.redirect.destinationUrl;
          }

          return NextResponse.redirect(targetUrl, {
            status: 301, // Permanent redirect
            headers: {
              "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
              [REQUEST_ID_HEADER]: requestId,
            },
          });
        }
      }
    } catch (error) {
      // Redirect check failed, continue without redirect
      console.error("Redirect check failed:", error);
    }

    // Check for maintenance mode on public routes
    try {
      const maintenanceUrl = new URL("/api/internal/check-maintenance", request.url);
      maintenanceUrl.searchParams.set("churchSlug", tenantSlug);

      const maintenanceResponse = await fetch(maintenanceUrl.toString(), {
        headers: { "x-internal-request": "1" },
        next: { revalidate: 30 }, // Cache for 30 seconds
      });

      if (maintenanceResponse.ok) {
        const maintenanceData = await maintenanceResponse.json();
        if (maintenanceData.maintenanceMode) {
          // Return maintenance page response
          return new NextResponse(
            `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coming Soon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    }
    .container { max-width: 500px; }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    p { font-size: 1.25rem; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Coming Soon</h1>
    <p>We're working on something amazing. Check back soon!</p>
  </div>
</body>
</html>`,
            {
              status: 503,
              headers: {
                "Content-Type": "text/html",
                "Retry-After": "3600",
                "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
                [REQUEST_ID_HEADER]: requestId,
              },
            }
          );
        }
      }
    } catch (error) {
      // Maintenance check failed, continue normally
      console.error("Maintenance check failed:", error);
    }
  }

  // Create response with tenant context in headers
  const requestHeaders = new Headers(request.headers);

  // Pass request ID for correlation (Phase 5)
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  // Pass the slug for tenant resolution in server components/routes
  requestHeaders.set(TENANT_HEADER_SLUG, tenantSlug);
  requestHeaders.set("x-site-type", "church");

  // Mark if this was resolved via custom domain
  if (isCustomDomain && customDomainHostname) {
    requestHeaders.set(TENANT_HEADER_CUSTOM_DOMAIN, customDomainHostname);
  }

  // For admin routes, check authentication
  if (isAdminRoute(pathname)) {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      // Redirect to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Note: Full session validation happens in the route handler
    // We just check for cookie presence here to avoid database calls in Edge
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add rate limit headers
  response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());

  // Add request ID to response headers for client-side correlation
  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}

/**
 * Configure which routes the middleware runs on.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
