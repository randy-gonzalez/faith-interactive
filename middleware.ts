/**
 * Next.js Middleware - Marketing Site Only
 *
 * Simplified middleware for marketing-only site.
 * All requests are routed to the /m route group.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseHostname, getSurfaceRoutePrefix } from "@/lib/hostname/parser";

// ============================================================================
// Constants
// ============================================================================

/** Headers used to pass context to the application */
const HEADERS = {
  REQUEST_ID: "x-request-id",
  SURFACE_TYPE: "x-surface-type",
} as const;

/** Routes that don't require surface routing (global routes) */
const GLOBAL_ROUTES = ["/api/health", "/api/marketing"];

// ============================================================================
// Rate Limiting (Edge-compatible, in-memory)
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const max = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);
  const windowSeconds = parseInt(
    process.env.RATE_LIMIT_WINDOW_SECONDS || "60",
    10
  );
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get client IP from request headers
 */
function getClientIp(request: NextRequest): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  return "unknown";
}

/**
 * Generate or retrieve request ID for correlation
 */
function getOrGenerateRequestId(request: NextRequest): string {
  const existingId =
    request.headers.get(HEADERS.REQUEST_ID) || request.headers.get("cf-ray");
  if (existingId) return existingId;

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `req_${timestamp}_${random}`;
}

/**
 * Check if a route is global (doesn't require surface routing)
 */
function isGlobalRoute(pathname: string): boolean {
  return GLOBAL_ROUTES.some((route) => pathname.startsWith(route));
}

// ============================================================================
// Main Middleware
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const requestId = getOrGenerateRequestId(request);

  // Debug logging for hostname routing
  if (process.env.NODE_ENV !== "production") {
    const parsed = parseHostname(hostname);
    console.log(
      `[Middleware] hostname=${hostname} surface=${parsed.surface} path=${pathname}`
    );
  }

  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(clientIp);

  if (!rateLimitResult.allowed) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
        "X-RateLimit-Remaining": "0",
        [HEADERS.REQUEST_ID]: requestId,
      },
    });
  }

  // Build request headers for downstream
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(HEADERS.REQUEST_ID, requestId);
  requestHeaders.set(HEADERS.SURFACE_TYPE, "marketing");

  // Global routes and API routes don't need rewriting
  if (isGlobalRoute(pathname) || pathname.startsWith("/api/")) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimitResult.remaining.toString()
    );
    response.headers.set(HEADERS.REQUEST_ID, requestId);
    return response;
  }

  // Rewrite page routes to the /m route group
  const routePrefix = getSurfaceRoutePrefix("marketing");
  const rewritePath = `${routePrefix}${pathname === "/" ? "" : pathname}`;

  const rewriteUrl = new URL(rewritePath, request.url);

  // Preserve query params
  request.nextUrl.searchParams.forEach((value: string, key: string) => {
    rewriteUrl.searchParams.set(key, value);
  });

  const response = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });

  // Add standard headers
  response.headers.set(
    "X-RateLimit-Remaining",
    rateLimitResult.remaining.toString()
  );
  response.headers.set(HEADERS.REQUEST_ID, requestId);

  return response;
}

/**
 * Configure which routes the middleware runs on
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
