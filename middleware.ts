/**
 * Next.js Middleware - Hostname-Based Routing
 *
 * This middleware implements hard isolation by hostname:
 *
 * Production:
 * - faith-interactive.com                => (marketing) surface
 * - platform.faith-interactive.com       => (platform) surface
 * - admin.faith-interactive.com          => (admin) surface
 * - *.faith-interactive.com              => (tenant) surface
 * - Custom domains                       => (tenant) surface
 *
 * Local Development:
 * - faith-interactive.local              => (marketing) surface
 * - platform.faith-interactive.local     => (platform) surface
 * - admin.faith-interactive.local        => (admin) surface
 * - *.faith-interactive.local            => (tenant) surface
 *
 * Each surface has:
 * - Isolated route group with own layout
 * - Isolated CSS
 * - Isolated auth rules
 * - No cross-surface route bleed
 *
 * @see lib/hostname/parser.ts for hostname parsing utilities
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  parseHostname,
  getSurfaceRoutePrefix,
  type AppSurface,
} from "@/lib/hostname/parser";

// ============================================================================
// Constants
// ============================================================================

/** Headers used to pass context to the application */
const HEADERS = {
  CHURCH_ID: "x-church-id",
  CHURCH_SLUG: "x-church-slug",
  CHURCH_NAME: "x-church-name",
  CUSTOM_DOMAIN: "x-custom-domain",
  REQUEST_ID: "x-request-id",
  SURFACE_TYPE: "x-surface-type",
  SITE_TYPE: "x-site-type", // Legacy: "marketing" | "church"
} as const;

/** Session cookie name */
const SESSION_COOKIE_NAME = "fi_session";

/** Routes that don't require tenant context (global routes) */
const GLOBAL_ROUTES = [
  "/api/health",
  "/api/internal/resolve-domain",
  "/api/internal/check-redirect",
  "/api/internal/check-maintenance",
];

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

/**
 * Resolve custom domain to church slug via internal API
 */
async function resolveCustomDomain(
  hostname: string,
  request: NextRequest
): Promise<string | null> {
  try {
    const resolveUrl = new URL("/api/internal/resolve-domain", request.url);
    resolveUrl.searchParams.set("hostname", hostname.split(":")[0].toLowerCase());

    const response = await fetch(resolveUrl.toString(), {
      headers: { "x-internal-request": "1" },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (response.ok) {
      const data = await response.json();
      return data.churchSlug || null;
    }
  } catch (error) {
    console.error("Custom domain resolution failed:", error);
  }
  return null;
}

/**
 * Check for redirect rules on tenant public routes
 */
async function checkRedirectRule(
  churchSlug: string,
  pathname: string,
  request: NextRequest
): Promise<string | null> {
  try {
    const redirectUrl = new URL("/api/internal/check-redirect", request.url);
    redirectUrl.searchParams.set("churchSlug", churchSlug);
    redirectUrl.searchParams.set("path", pathname);

    const response = await fetch(redirectUrl.toString(), {
      headers: { "x-internal-request": "1" },
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.redirect?.destinationUrl) {
        return data.redirect.destinationUrl.startsWith("/")
          ? new URL(data.redirect.destinationUrl, request.url).toString()
          : data.redirect.destinationUrl;
      }
    }
  } catch (error) {
    console.error("Redirect check failed:", error);
  }
  return null;
}

/**
 * Check for maintenance mode on tenant public routes
 */
async function checkMaintenanceMode(
  churchSlug: string,
  request: NextRequest
): Promise<boolean> {
  try {
    const maintenanceUrl = new URL(
      "/api/internal/check-maintenance",
      request.url
    );
    maintenanceUrl.searchParams.set("churchSlug", churchSlug);

    const response = await fetch(maintenanceUrl.toString(), {
      headers: { "x-internal-request": "1" },
      next: { revalidate: 30 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.maintenanceMode === true;
    }
  } catch (error) {
    console.error("Maintenance check failed:", error);
  }
  return false;
}

/**
 * Return maintenance mode HTML response
 */
function maintenanceResponse(requestId: string): NextResponse {
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
        [HEADERS.REQUEST_ID]: requestId,
      },
    }
  );
}

/**
 * Build the login redirect URL for a surface
 */
function getLoginUrl(surface: AppSurface, request: NextRequest): URL {
  // All surfaces have their own /login route within the surface
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);
  return loginUrl;
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
    console.log(`[Middleware] hostname=${hostname} surface=${parsed.surface} slug=${parsed.churchSlug} path=${pathname}`);
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

  // Global routes don't need surface routing
  if (isGlobalRoute(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(HEADERS.REQUEST_ID, requestId);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set(HEADERS.REQUEST_ID, requestId);
    return response;
  }

  // Parse hostname to determine surface
  const parsed = parseHostname(hostname);
  let { surface, churchSlug } = parsed;
  let customDomainHostname: string | null = null;

  // For custom domains, resolve church slug via database
  if (surface === "tenant" && !churchSlug) {
    churchSlug = await resolveCustomDomain(hostname, request);
    if (churchSlug) {
      customDomainHostname = hostname.split(":")[0].toLowerCase();
    } else {
      // Unrecognized custom domain - could redirect to marketing or show error
      console.warn(`Unrecognized hostname: ${hostname}`);
      // For now, treat as marketing
      surface = "marketing";
    }
  }

  // Build request headers for downstream
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(HEADERS.REQUEST_ID, requestId);
  requestHeaders.set(HEADERS.SURFACE_TYPE, surface);

  // Surface-specific handling
  switch (surface) {
    case "marketing": {
      requestHeaders.set(HEADERS.SITE_TYPE, "marketing");
      break;
    }

    case "platform": {
      requestHeaders.set(HEADERS.SITE_TYPE, "platform");

      // Auth check for platform - cookie presence only (full validation in layout)
      if (pathname !== "/login" && !pathname.startsWith("/api/")) {
        const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
        if (!sessionToken) {
          return NextResponse.redirect(getLoginUrl(surface, request));
        }
      }
      break;
    }

    case "admin": {
      requestHeaders.set(HEADERS.SITE_TYPE, "admin");

      // Auth check for admin - cookie presence only (full validation in layout)
      if (
        pathname !== "/login" &&
        pathname !== "/forgot-password" &&
        pathname !== "/reset-password" &&
        pathname !== "/accept-invite" &&
        !pathname.startsWith("/api/")
      ) {
        const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
        if (!sessionToken) {
          return NextResponse.redirect(getLoginUrl(surface, request));
        }
      }
      break;
    }

    case "tenant": {
      requestHeaders.set(HEADERS.SITE_TYPE, "church");

      if (!churchSlug) {
        // This shouldn't happen if we handled custom domains above
        console.error("Tenant surface without church slug");
        return NextResponse.redirect(new URL("/", request.url));
      }

      requestHeaders.set(HEADERS.CHURCH_SLUG, churchSlug);

      if (customDomainHostname) {
        requestHeaders.set(HEADERS.CUSTOM_DOMAIN, customDomainHostname);
      }

      // Check for redirect rules
      const redirectTarget = await checkRedirectRule(
        churchSlug,
        pathname,
        request
      );
      if (redirectTarget) {
        return NextResponse.redirect(redirectTarget, {
          status: 301,
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            [HEADERS.REQUEST_ID]: requestId,
          },
        });
      }

      // Check for maintenance mode
      const isInMaintenance = await checkMaintenanceMode(churchSlug, request);
      if (isInMaintenance) {
        return maintenanceResponse(requestId);
      }
      break;
    }
  }

  // API routes should NOT be rewritten - they stay at /api/*
  // Only rewrite page routes to surface-specific prefixes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set(HEADERS.REQUEST_ID, requestId);
    return response;
  }

  // Rewrite page routes to the appropriate route group
  const routePrefix = getSurfaceRoutePrefix(surface);
  const rewritePath = `${routePrefix}${pathname === "/" ? "" : pathname}`;

  const rewriteUrl = new URL(rewritePath, request.url);

  // Preserve query params
  request.nextUrl.searchParams.forEach((value, key) => {
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
