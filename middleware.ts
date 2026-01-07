/**
 * Next.js Middleware - Marketing Site
 *
 * Handles rate limiting and request context headers.
 * No route rewrites needed - routes are at root level.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================================
// Constants
// ============================================================================

/** Headers used to pass context to the application */
const HEADERS = {
  REQUEST_ID: "x-request-id",
  SURFACE_TYPE: "x-surface-type",
} as const;

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

// ============================================================================
// Main Middleware
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const requestId = getOrGenerateRequestId(request);

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

  const response = NextResponse.next({ request: { headers: requestHeaders } });
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
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
