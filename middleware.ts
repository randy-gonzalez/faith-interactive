/**
 * Next.js Middleware
 *
 * This middleware runs on every request and handles:
 * 1. Subdomain extraction → tenant resolution
 * 2. Authentication checks for protected routes
 * 3. Rate limiting (foundation)
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

// Routes that don't require authentication
const PUBLIC_ROUTES = [
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

// Public website paths (no auth required, tenant required)
// These are the public-facing church website pages
const PUBLIC_WEBSITE_PREFIXES = [
  "/p/",      // Public pages
  "/sermons", // Public sermons (when not under dashboard)
  "/events",  // Public events (when not under dashboard)
  "/staff",   // Public leadership/staff page
  "/contact", // Contact page
];

// Dashboard routes that require authentication
const DASHBOARD_ROUTES = [
  "/dashboard",
  "/pages",
  "/manage-sermons",
  "/manage-events",
  "/announcements",
  "/leadership",
  "/team",
  "/settings",
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
 * Check if a route is public (doesn't require auth)
 */
function isPublicRoute(pathname: string): boolean {
  // Check explicit public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return true;
  }

  // Check public website prefixes
  if (PUBLIC_WEBSITE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  // Root path is public (home page)
  if (pathname === "/" || pathname === "") {
    return true;
  }

  return false;
}

/**
 * Check if a route requires authentication (dashboard routes)
 */
function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTES.some((route) => pathname.startsWith(route));
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

  // If no subdomain and not a global route, redirect to main site or show error
  if (!subdomain) {
    return new NextResponse(
      JSON.stringify({
        error: "No tenant specified",
        message: "Please access the application via a church subdomain (e.g., demo.localhost:3000)",
        hint: "For local development, add '127.0.0.1 demo.localhost' to your /etc/hosts file",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Resolve tenant from subdomain
  // Since we can't use Prisma in Edge middleware, we'll resolve via an API call
  // For Phase 0, we'll use a simple approach: pass the subdomain and resolve in the route
  // The actual church lookup happens in the API route/page

  // Create response with tenant context in headers
  const requestHeaders = new Headers(request.headers);

  // We pass the slug for now; the actual resolution happens in the server component/route
  // This is a trade-off for Edge compatibility
  requestHeaders.set(TENANT_HEADER_SLUG, subdomain);

  // For dashboard routes, check authentication
  if (isDashboardRoute(pathname)) {
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
