/**
 * Authentication & Authorization Guards
 *
 * Server-side utilities for protecting routes and actions.
 * These guards verify both authentication (valid session) and
 * authorization (role-based permissions).
 *
 * NEW MODEL (User System Redesign):
 * - Users can belong to multiple churches via ChurchMembership
 * - Session has activeChurchId which determines current context
 * - Role comes from membership or is implicit ADMIN for platform users
 * - Platform users have access to ALL churches
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
import type { AuthenticatedUser, PlatformUser } from "@/types";
import type { UserRole, PlatformRole } from "@prisma/client";

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
 *
 * Since all admin is on the main domain, we get church context from:
 * 1. The user's session (activeChurchId) - primary source
 * 2. The x-church-slug header (for subdomain public pages, if any)
 *
 * Access is granted if:
 * - User has an active membership in the church, OR
 * - User has a platform role (implicit access to all churches)
 */
export async function getAuthContext(): Promise<{
  user: AuthenticatedUser;
  church: { id: string; slug: string; name: string };
} | null> {
  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  // Get church context - prefer session's activeChurchId (main domain admin)
  // Fall back to header (subdomain public pages)
  let church: { id: string; slug: string; name: string } | null = null;

  if (user.activeChurchId) {
    // Get church from user's active session
    church = await prisma.church.findUnique({
      where: { id: user.activeChurchId },
      select: { id: true, slug: true, name: true },
    });
  }

  if (!church) {
    // Try getting from header (subdomain context)
    church = await getChurchContext();
  }

  if (!church) {
    // No church context available
    // Platform users without a selected church should go to /platform
    // Regular users should go to /select-church
    return null;
  }

  // Check if user has access to this church
  const hasMembership = user.memberships?.some(m => m.churchId === church.id) ?? false;
  const isPlatformUser = user.platformRole !== null;

  if (!hasMembership && !isPlatformUser) {
    // User doesn't have access to this church
    return null;
  }

  // Get the correct role for this church
  const membership = user.memberships?.find(m => m.churchId === church.id);
  const role = membership?.role ?? (isPlatformUser ? "ADMIN" : "VIEWER");

  return {
    user: {
      ...user,
      activeChurchId: church.id,
      activeChurch: church,
      role,
      churchId: church.id, // Backward compatibility
    },
    church,
  };
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
    redirect("/admin/dashboard");
  }

  return user;
}

// ==============================================================================
// PLATFORM ADMIN GUARDS (Platform Panel)
// ==============================================================================
// These guards are for Fi staff access to /platform panel.
// Platform roles are SEPARATE from church roles.
// ==============================================================================

/**
 * Check if user has a platform role (any level).
 */
export function hasPlatformRole(user: AuthenticatedUser | null): user is PlatformUser {
  return user !== null && user.platformRole !== null;
}

/**
 * Check if user is a platform admin (full access).
 */
export function isPlatformAdmin(user: AuthenticatedUser | null): boolean {
  return user !== null && user.platformRole === "PLATFORM_ADMIN";
}

/**
 * Check if user is platform staff (read-only or limited access).
 */
export function isPlatformStaff(user: AuthenticatedUser | null): boolean {
  return user !== null && user.platformRole === "PLATFORM_STAFF";
}

/**
 * Require any platform role. Throws AuthError if not a platform user.
 * Use this for general /platform access.
 */
export async function requirePlatformUser(): Promise<PlatformUser> {
  const user = await requireAuth();

  if (!hasPlatformRole(user)) {
    throw new AuthError(
      "Platform access required. You must be a Faith Interactive staff member.",
      "FORBIDDEN"
    );
  }

  return user;
}

/**
 * Require platform admin role. Throws AuthError if not a platform admin.
 * Use this for write operations in /platform.
 */
export async function requirePlatformAdmin(): Promise<PlatformUser> {
  const user = await requireAuth();

  if (!isPlatformAdmin(user)) {
    throw new AuthError(
      "Platform admin access required",
      "FORBIDDEN"
    );
  }

  // Type assertion is safe because we checked platformRole is not null
  return user as PlatformUser;
}

/**
 * Require platform admin or staff role.
 * Staff can have read-only access.
 */
export async function requirePlatformRole(
  role: PlatformRole
): Promise<PlatformUser> {
  const user = await requireAuth();

  if (user.platformRole !== role) {
    throw new AuthError(
      `Platform role '${role}' required`,
      "FORBIDDEN"
    );
  }

  return user as PlatformUser;
}

/**
 * Redirect to login if not a platform user.
 * Use this in /platform page components.
 *
 * With the unified login system:
 * - Unauthenticated users go to /login
 * - After login, platform users are redirected to /platform
 * - Non-platform users are redirected to their church dashboard
 */
export async function requirePlatformUserOrRedirect(): Promise<PlatformUser> {
  const user = await getAuthUser();

  if (!user) {
    // Redirect to unified login page
    redirect("/login?returnTo=/platform");
  }

  if (!hasPlatformRole(user)) {
    // User is authenticated but not a platform user
    // Redirect them to their church dashboard instead
    if (user.activeChurchId && user.activeChurch) {
      redirect(`/admin/dashboard`);
    }
    // If they have no active church, send to login to select one
    redirect("/login");
  }

  return user;
}

/**
 * Redirect if not a platform admin.
 * Use this in /platform page components that require write access.
 */
export async function requirePlatformAdminOrRedirect(): Promise<PlatformUser> {
  const user = await requirePlatformUserOrRedirect();

  if (!isPlatformAdmin(user)) {
    // User is platform staff but not admin, redirect to read-only view
    redirect("/platform");
  }

  return user;
}
