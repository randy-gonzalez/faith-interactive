/**
 * Reset Password API Route
 *
 * POST /api/auth/reset-password
 *
 * Completes the password reset flow using a valid token.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import {
  validatePasswordResetToken,
  consumePasswordResetToken,
} from "@/lib/auth/reset-token";
import { deleteAllUserSessions } from "@/lib/auth/session";
import { resetPasswordSchema, formatZodError } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const parseResult = resetPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: formatZodError(parseResult.error) },
        { status: 400 }
      );
    }

    const { token, password } = parseResult.data;

    // Validate the reset token
    const tokenData = await validatePasswordResetToken(token);

    if (!tokenData) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid or expired reset token. Please request a new password reset.",
        },
        { status: 400 }
      );
    }

    const { userId, churchId } = tokenData;

    // Hash the new password
    const passwordHash = await hashPassword(password);

    // Update user's password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Consume the token (mark as used)
    await consumePasswordResetToken(token);

    // Invalidate all existing sessions for security
    // User will need to log in again with new password
    await deleteAllUserSessions(userId, churchId);

    logger.info("Password reset completed", { userId, churchId });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: "Password has been reset successfully. Please log in with your new password." },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Reset password error", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
