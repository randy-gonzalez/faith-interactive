/**
 * Session Management
 *
 * Handles database-backed session creation, validation, and cleanup.
 *
 * WHY DATABASE SESSIONS (vs JWT-only):
 * - Sessions can be revoked immediately (logout, security breach)
 * - Session data stays server-side (less client exposure)
 * - Easy to audit active sessions
 * - No token refresh complexity
 *
 * FLOW:
 * 1. User logs in → create session in DB → store token in cookie
 * 2. Request comes in → read token from cookie → validate against DB
 * 3. User logs out → delete session from DB → clear cookie
 */

import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";
import type { SessionData, SafeUser } from "@/types";

/**
 * Generate a cryptographically secure session token
 */
function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Get session duration from environment (default 7 days)
 */
function getSessionDuration(): number {
  const days = parseInt(process.env.SESSION_DURATION_DAYS || "7", 10);
  return days * 24 * 60 * 60 * 1000; // Convert to milliseconds
}

/**
 * Create a new session for a user.
 *
 * @param userId - User ID
 * @param churchId - Church/tenant ID
 * @param metadata - Optional metadata (user agent, IP)
 * @returns Session token to be stored in cookie
 */
export async function createSession(
  userId: string,
  churchId: string,
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + getSessionDuration());

  // Use raw prisma here since we're creating the session
  // and need to set churchId explicitly
  await prisma.session.create({
    data: {
      token,
      userId,
      churchId,
      expiresAt,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    },
  });

  logger.info("Session created", { userId, churchId });
  return token;
}

/**
 * Validate a session token and return session data.
 *
 * @param token - Session token from cookie
 * @returns Session data if valid, null otherwise
 */
export async function validateSession(
  token: string
): Promise<SessionData | null> {
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    select: {
      id: true,
      userId: true,
      churchId: true,
      expiresAt: true,
    },
  });

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await prisma.session.delete({
      where: { id: session.id },
    }).catch(() => {
      // Ignore errors during cleanup
    });
    return null;
  }

  return session;
}

/**
 * Get the user associated with a session.
 *
 * @param token - Session token
 * @returns User data if session is valid, null otherwise
 */
export async function getUserFromSession(
  token: string
): Promise<(SafeUser & { churchId: string }) | null> {
  const session = await validateSession(token);
  if (!session) {
    return null;
  }

  const db = getTenantPrisma(session.churchId);
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      churchId: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

/**
 * Delete a session (logout).
 *
 * @param token - Session token to invalidate
 */
export async function deleteSession(token: string): Promise<void> {
  try {
    await prisma.session.delete({
      where: { token },
    });
    logger.info("Session deleted");
  } catch {
    // Session may already be deleted, that's fine
  }
}

/**
 * Delete all sessions for a user (logout from all devices).
 *
 * @param userId - User ID
 * @param churchId - Church/tenant ID
 */
export async function deleteAllUserSessions(
  userId: string,
  churchId: string
): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      userId,
      churchId,
    },
  });
  logger.info("All sessions deleted for user", { userId, churchId });
}

/**
 * Clean up expired sessions.
 *
 * This should be run periodically (e.g., daily cron job) to
 * prevent the sessions table from growing indefinitely.
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  if (result.count > 0) {
    logger.info("Cleaned up expired sessions", { count: result.count });
  }

  return result.count;
}
