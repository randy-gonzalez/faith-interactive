/**
 * Login API Route
 *
 * POST /api/auth/login
 *
 * Authenticates a user with email and password.
 * Creates a session and sets a secure cookie.
 *
 * Phase 5: Includes account lockout protection and audit logging.
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { createSessionCookieHeader } from "@/lib/auth/cookies";
import { loginSchema, formatZodError } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import { accountLockout } from "@/lib/security/account-lockout";
import { auditLog } from "@/lib/audit/audit-log";
import type { LoginResponse, SafeUser } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Get tenant context from middleware
    const headerStore = await headers();
    const churchSlug = headerStore.get("x-church-slug");

    if (!churchSlug) {
      return NextResponse.json<LoginResponse>(
        { success: false, error: "Tenant context required" },
        { status: 400 }
      );
    }

    // Resolve church from slug
    const church = await prisma.church.findUnique({
      where: { slug: churchSlug },
      select: { id: true, name: true },
    });

    if (!church) {
      logger.warn("Login attempt for unknown church", { slug: churchSlug });
      return NextResponse.json<LoginResponse>(
        { success: false, error: "Invalid tenant" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<LoginResponse>(
        { success: false, error: formatZodError(parseResult.error) },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    // Get client IP for lockout tracking
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
                     request.headers.get("cf-connecting-ip") ||
                     request.headers.get("x-real-ip") ||
                     "unknown";

    // Phase 5: Check for account lockout
    const lockoutCheck = await accountLockout.checkAllowed(
      church.id,
      email,
      clientIp
    );

    if (!lockoutCheck.allowed) {
      const errorMessage = lockoutCheck.reason === "too_many_attempts"
        ? `Too many failed attempts. Please try again in ${lockoutCheck.lockoutMinutesRemaining} minutes.`
        : "Too many login attempts from this location. Please try again later.";

      logger.warn("Login blocked by lockout", {
        churchId: church.id,
        email: email.toLowerCase(),
        reason: lockoutCheck.reason,
        clientIp,
      });

      return NextResponse.json<LoginResponse>(
        { success: false, error: errorMessage },
        { status: 429 }
      );
    }

    // Find user by email within the church
    const user = await prisma.user.findUnique({
      where: {
        churchId_email: {
          churchId: church.id,
          email: email.toLowerCase(),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Use constant-time comparison to prevent timing attacks
    // Even if user doesn't exist, we verify against a dummy hash
    const dummyHash = "$2a$12$dummy.hash.to.prevent.timing.attacks.placeholder";
    const hashToVerify = user?.passwordHash || dummyHash;
    const passwordValid = await verifyPassword(password, hashToVerify);

    if (!user || !passwordValid || !user.isActive) {
      const failReason = !user ? "user_not_found" : !passwordValid ? "invalid_password" : "inactive_user";

      logger.warn("Failed login attempt", {
        churchId: church.id,
        email: email.toLowerCase(),
        reason: failReason,
      });

      // Phase 5: Record failed attempt for lockout tracking
      await accountLockout.recordAttempt(
        church.id,
        email,
        clientIp,
        false,
        failReason
      );

      // Phase 5: Audit log for failed login
      await auditLog.logAuthEvent(
        church.id,
        "LOGIN_FAILED",
        email.toLowerCase(),
        user?.id ?? null,
        clientIp,
        { reason: failReason }
      );

      // Generic error message to prevent user enumeration
      return NextResponse.json<LoginResponse>(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    const userAgent = request.headers.get("user-agent") || undefined;

    const sessionToken = await createSession(user.id, church.id, {
      userAgent,
      ipAddress: clientIp,
    });

    // Phase 5: Record successful login attempt
    await accountLockout.recordAttempt(
      church.id,
      email,
      clientIp,
      true
    );

    // Phase 5: Audit log for successful login
    await auditLog.logAuthEvent(
      church.id,
      "LOGIN_SUCCESS",
      user.email,
      user.id,
      clientIp
    );

    // Prepare user response (without sensitive data)
    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    logger.info("User logged in", {
      userId: user.id,
      churchId: church.id,
    });

    // Return response with session cookie
    const response = NextResponse.json<LoginResponse>(
      { success: true, user: safeUser },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", createSessionCookieHeader(sessionToken));

    return response;
  } catch (error) {
    logger.error("Login error", error instanceof Error ? error : null);
    return NextResponse.json<LoginResponse>(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
