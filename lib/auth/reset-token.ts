/**
 * Password Reset Token Management
 *
 * Handles creation and validation of password reset tokens.
 *
 * SECURITY NOTES:
 * - Tokens are cryptographically random
 * - Tokens expire quickly (default 1 hour)
 * - Tokens are single-use (marked as used after consumption)
 * - Token existence is not revealed to prevent user enumeration
 */

import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

/**
 * Generate a cryptographically secure reset token
 */
function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Get token expiration from environment (default 1 hour)
 */
function getTokenExpiration(): Date {
  const hours = parseInt(process.env.PASSWORD_RESET_EXPIRATION_HOURS || "1", 10);
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Create a password reset token for a user.
 *
 * @param userId - User ID
 * @returns The reset token
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  // Invalidate any existing tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(), // Mark as used to invalidate
    },
  });

  const token = generateResetToken();
  const expiresAt = getTokenExpiration();

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  logger.info("Password reset token created", { userId });
  return token;
}

/**
 * Validate a password reset token.
 *
 * @param token - The reset token to validate
 * @returns User ID if valid, null otherwise
 */
export async function validatePasswordResetToken(
  token: string
): Promise<{ userId: string } | null> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  // Token not found
  if (!resetToken) {
    return null;
  }

  // Token already used
  if (resetToken.usedAt) {
    return null;
  }

  // Token expired
  if (resetToken.expiresAt < new Date()) {
    return null;
  }

  return {
    userId: resetToken.userId,
  };
}

/**
 * Consume a password reset token (mark as used).
 *
 * This should be called after successfully resetting the password.
 *
 * @param token - The reset token to consume
 */
export async function consumePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  logger.info("Password reset token consumed");
}

/**
 * Clean up expired password reset tokens.
 *
 * This should be run periodically to prevent table bloat.
 */
export async function cleanupExpiredResetTokens(): Promise<number> {
  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { usedAt: { not: null } },
      ],
    },
  });

  if (result.count > 0) {
    logger.info("Cleaned up password reset tokens", { count: result.count });
  }

  return result.count;
}
