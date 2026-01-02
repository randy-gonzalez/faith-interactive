/**
 * Unified Login API Route
 *
 * POST /api/auth/unified-login
 *
 * Single login endpoint for all users (platform and church).
 * All admin functionality is on the main domain.
 *
 * Redirect logic:
 * - Platform users → /platform
 * - Single church users → /admin/dashboard (with church context in session)
 * - Multi-church users → /select-church page
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { createSessionCookieHeader } from "@/lib/auth/cookies";
import { loginSchema, formatZodError } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

/**
 * Validate that a returnTo path is safe (must be a relative path on our domain).
 * Prevents open redirect vulnerabilities.
 */
function isValidReturnTo(returnTo: string): boolean {
  // Must start with / and not be a protocol-relative URL
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return false;
  }

  // Block common redirect attack patterns
  if (returnTo.includes("://") || returnTo.includes("\\")) {
    return false;
  }

  return true;
}

interface UnifiedLoginResponse {
  success: boolean;
  redirectUrl?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    platformRole: string | null;
  };
  memberships?: Array<{
    churchId: string;
    churchSlug: string;
    churchName: string;
    role: string;
  }>;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check for returnTo query param (from subdomain redirects)
    const returnTo = request.nextUrl.searchParams.get("returnTo");

    // Parse and validate request body
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<UnifiedLoginResponse>(
        { success: false, error: formatZodError(parseResult.error) },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    // Get client IP for logging
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Find user by globally unique email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        isActive: true,
        platformRole: true,
        memberships: {
          where: { isActive: true },
          select: {
            churchId: true,
            role: true,
            isPrimary: true,
            church: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
      },
    });

    // Constant-time comparison to prevent timing attacks
    const dummyHash =
      "$2a$12$dummy.hash.to.prevent.timing.attacks.placeholder";
    const hashToVerify = user?.passwordHash || dummyHash;
    const passwordValid = await verifyPassword(password, hashToVerify);

    if (!user || !passwordValid || !user.isActive) {
      const failReason = !user
        ? "user_not_found"
        : !passwordValid
          ? "invalid_password"
          : "inactive_user";

      logger.warn("Failed unified login attempt", {
        email: email.toLowerCase(),
        reason: failReason,
        clientIp,
      });

      return NextResponse.json<UnifiedLoginResponse>(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Determine initial active church and redirect
    // All admin routes are on the main domain
    let activeChurchId: string | null = null;
    let redirectUrl: string;

    // Case A: Platform user → /platform (or returnTo if valid)
    if (user.platformRole) {
      redirectUrl = returnTo && isValidReturnTo(returnTo) ? returnTo : "/platform";
      // Platform users start with no active church context
    }
    // Case B: User with exactly one church → /admin/dashboard
    else if (user.memberships.length === 1) {
      const membership = user.memberships[0];
      activeChurchId = membership.churchId;
      // Use returnTo if valid, otherwise default admin dashboard
      redirectUrl = returnTo && isValidReturnTo(returnTo) ? returnTo : "/admin/dashboard";
    }
    // Case C: User with multiple churches → /select-church page
    else if (user.memberships.length > 1) {
      // Set primary church as active, or first one
      const primaryMembership =
        user.memberships.find((m) => m.isPrimary) || user.memberships[0];
      activeChurchId = primaryMembership.churchId;
      redirectUrl = "/select-church";
    }
    // Case D: User with no churches and no platform role → error
    else {
      logger.warn("User has no church memberships and no platform role", {
        userId: user.id,
        email: user.email,
      });
      return NextResponse.json<UnifiedLoginResponse>(
        {
          success: false,
          error: "Your account is not associated with any organization",
        },
        { status: 403 }
      );
    }

    // Create session
    const userAgent = request.headers.get("user-agent") || undefined;
    const sessionToken = await createSession(user.id, activeChurchId, {
      userAgent,
      ipAddress: clientIp,
    });

    logger.info("Unified login successful", {
      userId: user.id,
      isPlatformUser: !!user.platformRole,
      membershipCount: user.memberships.length,
      activeChurchId,
    });

    // Build response
    const response = NextResponse.json<UnifiedLoginResponse>(
      {
        success: true,
        redirectUrl,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          platformRole: user.platformRole,
        },
        memberships: user.memberships.map((m) => ({
          churchId: m.churchId,
          churchSlug: m.church.slug,
          churchName: m.church.name,
          role: m.role,
        })),
      },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", createSessionCookieHeader(sessionToken));

    return response;
  } catch (error) {
    logger.error("Unified login error", error instanceof Error ? error : null);
    return NextResponse.json<UnifiedLoginResponse>(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
