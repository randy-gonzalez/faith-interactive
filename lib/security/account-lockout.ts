/**
 * Account Lockout Service
 *
 * Protects against brute-force login attacks by:
 * - Tracking failed login attempts
 * - Temporarily locking accounts after too many failures
 * - Providing IP-based rate limiting for login attempts
 *
 * Configuration via environment variables:
 * - MAX_FAILED_ATTEMPTS: Number of failures before lockout (default: 5)
 * - LOCKOUT_DURATION_MINUTES: How long to lock out (default: 15)
 * - ATTEMPT_WINDOW_MINUTES: Window for counting attempts (default: 15)
 *
 * NEW MODEL:
 * - Email is globally unique, so lockout is per-email (not per church + email)
 * - LoginAttempt no longer has churchId
 */

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

// Configuration
const MAX_FAILED_ATTEMPTS = parseInt(process.env.MAX_FAILED_ATTEMPTS || "5", 10);
const LOCKOUT_DURATION_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || "15", 10);
const ATTEMPT_WINDOW_MINUTES = parseInt(process.env.ATTEMPT_WINDOW_MINUTES || "15", 10);

/**
 * Result of checking if a login attempt is allowed
 */
export interface LockoutCheckResult {
  /** Whether the login attempt is allowed */
  allowed: boolean;
  /** If not allowed, the reason why */
  reason?: "too_many_attempts" | "ip_blocked";
  /** Number of remaining attempts before lockout */
  remainingAttempts?: number;
  /** When the lockout expires (if locked) */
  lockoutExpiresAt?: Date;
  /** Minutes until lockout expires */
  lockoutMinutesRemaining?: number;
}

/**
 * Account lockout service
 */
export const accountLockout = {
  /**
   * Check if a login attempt should be allowed
   *
   * @param _churchId - Deprecated, kept for backward compatibility
   * @param email - The email being used for login
   * @param ipAddress - The IP address of the request
   */
  async checkAllowed(
    _churchId: string,
    email: string,
    ipAddress: string
  ): Promise<LockoutCheckResult> {
    const windowStart = new Date(
      Date.now() - ATTEMPT_WINDOW_MINUTES * 60 * 1000
    );
    const normalizedEmail = email.toLowerCase();

    // Count failed attempts for this email within the window
    // Note: Now global since email is globally unique
    const emailAttempts = await prisma.loginAttempt.count({
      where: {
        email: normalizedEmail,
        success: false,
        createdAt: { gte: windowStart },
      },
    });

    if (emailAttempts >= MAX_FAILED_ATTEMPTS) {
      // Get the most recent failed attempt to calculate lockout expiry
      const lastAttempt = await prisma.loginAttempt.findFirst({
        where: {
          email: normalizedEmail,
          success: false,
          createdAt: { gte: windowStart },
        },
        orderBy: { createdAt: "desc" },
      });

      if (lastAttempt) {
        const lockoutExpiresAt = new Date(
          lastAttempt.createdAt.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000
        );

        if (lockoutExpiresAt > new Date()) {
          const minutesRemaining = Math.ceil(
            (lockoutExpiresAt.getTime() - Date.now()) / (60 * 1000)
          );

          return {
            allowed: false,
            reason: "too_many_attempts",
            remainingAttempts: 0,
            lockoutExpiresAt,
            lockoutMinutesRemaining: minutesRemaining,
          };
        }
      }
    }

    // Also check IP-based attempts (to prevent attackers trying many emails)
    const ipAttempts = await prisma.loginAttempt.count({
      where: {
        ipAddress,
        success: false,
        createdAt: { gte: windowStart },
      },
    });

    // IP threshold is higher since it could be a shared IP (corporate, mobile carrier, etc.)
    const IP_MAX_ATTEMPTS = MAX_FAILED_ATTEMPTS * 3; // 15 by default

    if (ipAttempts >= IP_MAX_ATTEMPTS) {
      return {
        allowed: false,
        reason: "ip_blocked",
        remainingAttempts: 0,
      };
    }

    return {
      allowed: true,
      remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - emailAttempts),
    };
  },

  /**
   * Record a login attempt
   *
   * @param _churchId - Deprecated, kept for backward compatibility
   * @param email - The email used for login
   * @param ipAddress - The IP address of the request
   * @param success - Whether the login succeeded
   * @param failReason - Reason for failure (if applicable)
   */
  async recordAttempt(
    _churchId: string,
    email: string,
    ipAddress: string,
    success: boolean,
    failReason?: string
  ): Promise<void> {
    try {
      await prisma.loginAttempt.create({
        data: {
          email: email.toLowerCase(),
          ipAddress,
          success,
          failReason: failReason ?? null,
        },
      });

      // Log for monitoring
      if (!success) {
        logger.warn("Failed login attempt recorded", {
          email: email.toLowerCase(),
          ipAddress,
          failReason,
        });
      }
    } catch (error) {
      // Don't fail the login flow if we can't record the attempt
      logger.error("Failed to record login attempt", error as Error);
    }
  },

  /**
   * Clear failed attempts after successful login
   * This is optional - you may want to keep the history for auditing
   */
  async clearFailedAttempts(
    _churchId: string,
    _email: string
  ): Promise<void> {
    // We don't actually delete attempts - we keep them for audit purposes
    // The lockout logic only counts recent attempts within the window
    // A successful login effectively resets the window by adding a success
  },

  /**
   * Cleanup old login attempts (call periodically via cron/scheduler)
   * Keeps attempts for 30 days for audit purposes
   */
  async cleanupOldAttempts(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await prisma.loginAttempt.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    logger.info("Cleaned up old login attempts", {
      deletedCount: result.count,
    });

    return result.count;
  },
};
