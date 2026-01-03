/**
 * CRM Authorization Guards
 *
 * Server-side utilities for protecting CRM routes and actions.
 * PLATFORM_ADMIN and SALES_REP platform roles can access CRM features.
 *
 * RBAC Rules:
 * - PLATFORM_ADMIN: Full access to all leads, stages, tasks, DNC. Can reassign owners.
 * - SALES_REP: Can view/edit their own leads + unassigned leads.
 *              Can create leads (assigned to themselves or unassigned).
 *              Can create tasks for leads they can access.
 */

import { getAuthUser, AuthError } from "@/lib/auth/guards";
import type { AuthenticatedUser } from "@/types";
import type { PlatformRole } from "@prisma/client";

// ==============================================================================
// CRM ROLE TYPES
// ==============================================================================

/**
 * CRM user - has PLATFORM_ADMIN or SALES_REP role
 */
export interface CrmUser extends AuthenticatedUser {
  platformRole: "PLATFORM_ADMIN" | "SALES_REP";
}

/**
 * CRM role check result
 */
export interface CrmRoleCheck {
  isCrmUser: boolean;
  isFiAdmin: boolean;
  isSalesRep: boolean;
}

// ==============================================================================
// CRM ROLE CHECKS
// ==============================================================================

/**
 * Check if a platform role has CRM access
 */
export function hasCrmAccess(role: PlatformRole | null): boolean {
  return role === "PLATFORM_ADMIN" || role === "SALES_REP";
}

/**
 * Check if user is PLATFORM_ADMIN (full CRM access)
 */
export function isPlatformAdmin(user: AuthenticatedUser | null): boolean {
  return user?.platformRole === "PLATFORM_ADMIN";
}

/**
 * Check if user is SALES_REP (limited CRM access)
 */
export function isSalesRep(user: AuthenticatedUser | null): boolean {
  return user?.platformRole === "SALES_REP";
}

/**
 * Get CRM role details for a user
 */
export function getCrmRoleCheck(user: AuthenticatedUser | null): CrmRoleCheck {
  return {
    isCrmUser: hasCrmAccess(user?.platformRole ?? null),
    isFiAdmin: isPlatformAdmin(user), // Legacy name kept for compatibility
    isSalesRep: isSalesRep(user),
  };
}

// ==============================================================================
// CRM GUARDS
// ==============================================================================

/**
 * Require CRM access (FI_ADMIN or SALES_REP).
 * Throws AuthError if not a CRM user.
 * Use this in API routes and server actions.
 */
export async function requireCrmUser(): Promise<CrmUser> {
  const user = await getAuthUser();

  if (!user) {
    throw new AuthError("Authentication required", "UNAUTHENTICATED");
  }

  if (!hasCrmAccess(user.platformRole)) {
    throw new AuthError(
      "CRM access required. You must be an Fi Admin or Sales Rep.",
      "FORBIDDEN"
    );
  }

  return user as CrmUser;
}

/**
 * Require PLATFORM_ADMIN role. Throws AuthError if not a PLATFORM_ADMIN.
 * Use this for admin-only operations like reassigning owners or managing stages.
 */
export async function requirePlatformAdmin(): Promise<CrmUser> {
  const user = await getAuthUser();

  if (!user) {
    throw new AuthError("Authentication required", "UNAUTHENTICATED");
  }

  if (!isPlatformAdmin(user)) {
    throw new AuthError("Platform Admin access required", "FORBIDDEN");
  }

  return user as CrmUser;
}

/**
 * Check if user can access a specific lead.
 * PLATFORM_ADMIN can access all leads.
 * SALES_REP can access leads they own OR unassigned leads (ownerUserId is null).
 */
export function canAccessLead(
  user: CrmUser,
  leadOwnerUserId: string | null
): boolean {
  if (isPlatformAdmin(user)) {
    return true;
  }
  // SALES_REP can access their own leads or unassigned leads
  return leadOwnerUserId === null || user.id === leadOwnerUserId;
}

/**
 * Require access to a specific lead.
 * Throws AuthError (as 404 to not leak existence) if access denied.
 */
export function requireLeadAccess(
  user: CrmUser,
  leadOwnerUserId: string | null
): void {
  if (!canAccessLead(user, leadOwnerUserId)) {
    // Return 404 instead of 403 to not leak existence of lead
    throw new AuthError("Lead not found", "FORBIDDEN");
  }
}

/**
 * Get the owner user ID to use when creating a lead.
 * PLATFORM_ADMIN can specify any owner (or default to self).
 * SALES_REP defaults to themselves but can create unassigned leads.
 */
export function getLeadOwnerForCreate(
  user: CrmUser,
  requestedOwnerId?: string | null
): string | null {
  if (isPlatformAdmin(user)) {
    // PLATFORM_ADMIN can assign to anyone or leave unassigned
    return requestedOwnerId === undefined ? user.id : requestedOwnerId;
  }
  // SALES_REP defaults to self
  return user.id;
}

/**
 * Check if user can reassign a lead's owner.
 * Only PLATFORM_ADMIN can reassign owners.
 */
export function canReassignLeadOwner(user: CrmUser): boolean {
  return isPlatformAdmin(user);
}

/**
 * Require permission to reassign lead owner.
 */
export function requireReassignPermission(user: CrmUser): void {
  if (!canReassignLeadOwner(user)) {
    throw new AuthError(
      "Only Platform Admin can reassign lead owners",
      "FORBIDDEN"
    );
  }
}

// ==============================================================================
// TASK CREATION RULES
// ==============================================================================

/**
 * Contact task types that are blocked for DNC leads (for SALES_REP)
 */
const CONTACT_TASK_TYPES = ["CALL", "EMAIL", "TEXT"] as const;

/**
 * Check if a task type is a contact type (blocked for DNC leads for reps)
 */
export function isContactTaskType(type: string): boolean {
  return CONTACT_TASK_TYPES.includes(type as (typeof CONTACT_TASK_TYPES)[number]);
}

/**
 * Check if user can create a contact task for a DNC lead.
 * PLATFORM_ADMIN can override DNC restrictions.
 * SALES_REP cannot create contact tasks for DNC leads.
 */
export function canCreateContactTaskForDnc(
  user: CrmUser,
  taskType: string,
  isDnc: boolean,
  adminOverride: boolean = false
): { allowed: boolean; reason?: string } {
  if (!isDnc) {
    return { allowed: true };
  }

  if (!isContactTaskType(taskType)) {
    return { allowed: true };
  }

  // DNC lead with contact task type
  if (isPlatformAdmin(user) && adminOverride) {
    return { allowed: true };
  }

  if (isSalesRep(user)) {
    return {
      allowed: false,
      reason: "Cannot create contact tasks (call, email, text) for DNC leads",
    };
  }

  // PLATFORM_ADMIN without override
  return {
    allowed: false,
    reason: "DNC lead - set allowOverride to true to create contact task",
  };
}

// ==============================================================================
// QUERY HELPERS
// ==============================================================================

/**
 * Get the WHERE clause for lead queries based on user role.
 * PLATFORM_ADMIN: no filter (sees all)
 * SALES_REP: sees their own leads + unassigned leads
 */
export function getLeadWhereClause(user: CrmUser): { OR?: Array<{ ownerUserId: string | null }> } {
  if (isPlatformAdmin(user)) {
    return {};
  }
  // SALES_REP can see their own leads OR unassigned leads
  return {
    OR: [
      { ownerUserId: user.id },
      { ownerUserId: null },
    ],
  };
}

/**
 * Get the WHERE clause for task queries based on user role.
 * PLATFORM_ADMIN: no filter (sees all)
 * SALES_REP: filter by ownerUserId
 */
export function getTaskWhereClause(user: CrmUser): { ownerUserId?: string } {
  if (isPlatformAdmin(user)) {
    return {};
  }
  return { ownerUserId: user.id };
}
