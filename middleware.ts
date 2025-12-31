/**
 * Next.js Middleware
 *
 * This middleware runs on every request and handles:
 * 1. Hostname-based routing (marketing vs church subdomain)
 * 2. Subdomain extraction → tenant resolution
 * 3. Authentication checks for protected routes (/admin/*)
 * 4. Rate limiting (foundation)
 *
 * Route Structure:
 * - Main domain (faithinteractive.com) → Marketing site (marketing)
 * - Subdomain (grace.faithinteractive.com) → Church site (church) + Admin (/admin/*)
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

  // Rate limiting check
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(clientIp);

  if (!rateLimitResult.allowed) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
        "X-RateLimit-Remaining": "0",
      },
    });
  }

  // Global routes don't need tenant context
  if (isGlobalRoute(pathname)) {
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    return response;
  }

  // Extract subdomain for tenant resolution
  const subdomain = extractSubdomain(hostname);

  // No subdomain = main domain = marketing site
  if (!subdomain) {
    // Marketing site routes - rewrite to (marketing) route group
    // The (marketing) layout/pages handle the main site
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("x-site-type", "marketing");
    return response;
  }

  // Has subdomain = church site
  // Create response with tenant context in headers
  const requestHeaders = new Headers(request.headers);

  // Pass the slug for tenant resolution in server components/routes
  requestHeaders.set(TENANT_HEADER_SLUG, subdomain);
  requestHeaders.set("x-site-type", "church");

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
