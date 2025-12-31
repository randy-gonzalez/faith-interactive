/**
 * Authentication & Authorization Guards
 *
 * Server-side utilities for protecting routes and actions.
 * These guards verify both authentication (valid session) and
 * authorization (role-based permissions).
 *
 * USAGE:
 * ```typescript
 * // In an API route or server action
 * const user = await requireAuth();
 * const admin = await requireRole("ADMIN");
 * ```
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getUserFromSession } from "./session";
import { SESSION_COOKIE_NAME } from "./cookies";
import { canEditContent, canManageTeam } from "./permissions";
import type { AuthenticatedUser } from "@/types";
import type { UserRole } from "@prisma/client";

/**
 * Error thrown when authentication or authorization fails.
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: "UNAUTHENTICATED" | "FORBIDDEN" | "INVALID_TENANT"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Get the current authenticated user from session.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const user = await getUserFromSession(sessionToken);
  return user;
}

/**
 * Require authentication. Throws AuthError if not authenticated.
 * Use this in API routes and server actions.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthUser();

  if (!user) {
    throw new AuthError("Authentication required", "UNAUTHENTICATED");
  }

  return user;
}

/**
 * Require a specific role. Throws AuthError if role doesn't match.
 */
export async function requireRole(role: UserRole): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (user.role !== role) {
    throw new AuthError(
      `Role '${role}' required, but user has role '${user.role}'`,
      "FORBIDDEN"
    );
  }

  return user;
}

/**
 * Require Admin role. Convenience wrapper.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  return requireRole("ADMIN");
}

/**
 * Require content edit permission (Admin or Editor).
 */
export async function requireContentEditor(): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!canEditContent(user.role)) {
    throw new AuthError(
      "You don't have permission to edit content",
      "FORBIDDEN"
    );
  }

  return user;
}

/**
 * Require team management permission (Admin only).
 */
export async function requireTeamManager(): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!canManageTeam(user.role)) {
    throw new AuthError(
      "You don't have permission to manage team members",
      "FORBIDDEN"
    );
  }

  return user;
}

/**
 * Get the current church context from headers.
 * The middleware extracts the subdomain and sets it in headers.
 * This function resolves the full church object from the slug.
 */
export async function getChurchContext(): Promise<{
  id: string;
  slug: string;
  name: string;
} | null> {
  const headerStore = await headers();
  const slug = headerStore.get("x-church-slug");

  if (!slug) {
    return null;
  }

  const church = await prisma.church.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true },
  });

  return church;
}

/**
 * Require church context. Throws AuthError if not available.
 */
export async function requireChurchContext(): Promise<{
  id: string;
  slug: string;
  name: string;
}> {
  const church = await getChurchContext();

  if (!church) {
    throw new AuthError("Invalid or missing tenant", "INVALID_TENANT");
  }

  return church;
}

/**
 * Get fully authenticated context (user + church).
 * Verifies that the user belongs to the current church context.
 */
export async function getAuthContext(): Promise<{
  user: AuthenticatedUser;
  church: { id: string; slug: string; name: string };
} | null> {
  const [user, church] = await Promise.all([
    getAuthUser(),
    getChurchContext(),
  ]);

  if (!user || !church) {
    return null;
  }

  // Security: Verify user belongs to this church
  if (user.churchId !== church.id) {
    // This should never happen, but guards against manipulation
    return null;
  }

  return { user, church };
}

/**
 * Require fully authenticated context. Throws if missing.
 */
export async function requireAuthContext(): Promise<{
  user: AuthenticatedUser;
  church: { id: string; slug: string; name: string };
}> {
  const context = await getAuthContext();

  if (!context) {
    throw new AuthError("Authentication required", "UNAUTHENTICATED");
  }

  return context;
}

/**
 * Redirect to login if not authenticated.
 * Use this in page components.
 */
export async function requireAuthOrRedirect(): Promise<AuthenticatedUser> {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Redirect to dashboard if user doesn't have required role.
 * Use this in page components.
 */
export async function requireRoleOrRedirect(role: UserRole): Promise<AuthenticatedUser> {
  const user = await requireAuthOrRedirect();

  if (user.role !== role) {
    redirect("/dashboard");
  }

  return user;
}
