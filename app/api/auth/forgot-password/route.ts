/**
 * Forgot Password API Route
 *
 * POST /api/auth/forgot-password
 *
 * Initiates the password reset flow by creating a reset token.
 *
 * SECURITY NOTES:
 * - Always returns success to prevent user enumeration
 * - Token is logged to console in development (no email infra in Phase 0)
 * - In production, this would send an email with the reset link
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { createPasswordResetToken } from "@/lib/auth/reset-token";
import { forgotPasswordSchema, formatZodError } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Get tenant context from middleware
    const headerStore = await headers();
    const churchSlug = headerStore.get("x-church-slug");

    if (!churchSlug) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tenant context required" },
        { status: 400 }
      );
    }

    // Resolve church from slug
    const church = await prisma.church.findUnique({
      where: { slug: churchSlug },
      select: { id: true },
    });

    if (!church) {
      // Still return success to prevent enumeration
      return NextResponse.json<ApiResponse>(
        { success: true, data: { message: "If an account exists, a reset link will be sent." } },
        { status: 200 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = forgotPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: formatZodError(parseResult.error) },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;

    // Find user by globally unique email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        isActive: true,
        memberships: {
          where: { churchId: church.id, isActive: true },
          take: 1,
        },
      },
    });

    // User must exist, be active, and have membership in this church
    if (user && user.isActive && user.memberships.length > 0) {
      const token = await createPasswordResetToken(user.id);

      // In development, log the reset token
      // In production, this would trigger an email
      if (process.env.NODE_ENV === "development") {
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
        console.log("\n=== PASSWORD RESET TOKEN ===");
        console.log(`Email: ${user.email}`);
        console.log(`Token: ${token}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log("============================\n");
      }

      logger.info("Password reset token created", {
        userId: user.id,
        churchId: church.id,
      });
    } else {
      // Log for monitoring, but don't reveal to user
      logger.info("Password reset requested for non-existent user", {
        email: email.toLowerCase(),
        churchId: church.id,
      });
    }

    // Always return success to prevent user enumeration
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: "If an account exists with that email, a password reset link will be sent.",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Forgot password error", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
