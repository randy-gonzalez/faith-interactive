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
 *
 * NEW MODEL (User System Redesign):
 * - Users are no longer bound to a single church
 * - Session has activeChurchId which can be switched
 * - Role comes from ChurchMembership, not User
 * - Platform users get implicit ADMIN access to all churches
 */

import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import type { SessionData, AuthenticatedUser } from "@/types";

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
 * @param activeChurchId - Initial active church (nullable for platform-only sessions)
 * @param metadata - Optional metadata (user agent, IP)
 * @returns Session token to be stored in cookie
 */
export async function createSession(
  userId: string,
  activeChurchId: string | null,
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + getSessionDuration());

  await prisma.session.create({
    data: {
      token,
      userId,
      activeChurchId,
      expiresAt,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    },
  });

  logger.info("Session created", { userId, activeChurchId });
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
      activeChurchId: true,
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
 * Fetches the user with their active church context and role.
 * - For regular users: role comes from ChurchMembership
 * - For platform users: implicit ADMIN role for any church
 *
 * @param token - Session token
 * @returns User data with active church context if session is valid, null otherwise
 */
export async function getUserFromSession(
  token: string
): Promise<AuthenticatedUser | null> {
  const session = await validateSession(token);
  if (!session) {
    return null;
  }

  // Fetch user with their memberships
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      platformRole: true,
      isActive: true,
      createdAt: true,
      memberships: {
        where: { isActive: true },
        select: {
          id: true,
          churchId: true,
          role: true,
          isPrimary: true,
          isActive: true,
          church: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  // Determine the role for the active church
  let role: "ADMIN" | "EDITOR" | "VIEWER" = "VIEWER";
  let activeChurch: { id: string; slug: string; name: string } | null = null;

  if (session.activeChurchId) {
    // Find membership for active church
    const membership = user.memberships.find(
      (m) => m.churchId === session.activeChurchId
    );

    if (membership) {
      role = membership.role;
      activeChurch = membership.church;
    } else if (user.platformRole) {
      // Platform users get implicit ADMIN access to any church
      const church = await prisma.church.findUnique({
        where: { id: session.activeChurchId },
        select: { id: true, slug: true, name: true },
      });
      if (church) {
        role = "ADMIN";
        activeChurch = church;
      }
    }
  }

  // churchId is required - if no active church, this is an error state
  // for routes that require church context
  const churchId = session.activeChurchId || "";

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    platformRole: user.platformRole,
    isActive: user.isActive,
    createdAt: user.createdAt,
    activeChurchId: session.activeChurchId,
    activeChurch,
    role,
    memberships: user.memberships,
    // Backward compatibility - always provide churchId
    churchId,
  };
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
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
  logger.info("All sessions deleted for user", { userId });
}

/**
 * Switch the active church for a session.
 *
 * @param token - Session token
 * @param churchId - New active church ID
 * @returns true if successful, false otherwise
 */
export async function switchActiveChurch(
  token: string,
  churchId: string
): Promise<boolean> {
  const session = await validateSession(token);
  if (!session) {
    return false;
  }

  // Get the user to verify they have access to this church
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      platformRole: true,
      memberships: {
        where: {
          churchId,
          isActive: true,
        },
      },
    },
  });

  if (!user) {
    return false;
  }

  // Check if user has access: either via membership or platform role
  const hasMembership = user.memberships.length > 0;
  const isPlatformUser = user.platformRole !== null;

  if (!hasMembership && !isPlatformUser) {
    logger.warn("User attempted to switch to unauthorized church", {
      userId: session.userId,
      churchId,
    });
    return false;
  }

  // Verify the church exists
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { id: true },
  });

  if (!church) {
    return false;
  }

  // Update the session
  await prisma.session.update({
    where: { id: session.id },
    data: { activeChurchId: churchId },
  });

  logger.info("Session church switched", {
    userId: session.userId,
    oldChurchId: session.activeChurchId,
    newChurchId: churchId,
  });

  return true;
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
