/**
 * Permission & Authorization Utilities
 *
 * Defines what each role can do and provides guards for server-side checks.
 * These checks MUST be performed on every API route and server action.
 *
 * ROLES:
 * - ADMIN: Full access, including user/team management
 * - EDITOR: Can create, edit, publish, and unpublish content
 * - VIEWER: Read-only access to dashboard
 *
 * RULES:
 * - Never trust client-provided role or churchId
 * - Always verify from session data
 * - Permission checks happen server-side only
 */

import { UserRole } from "@prisma/client";

/**
 * Permission types for content operations
 */
export type ContentPermission =
  | "content:read"
  | "content:create"
  | "content:edit"
  | "content:publish"
  | "content:delete";

/**
 * Permission types for team/user management
 */
export type TeamPermission =
  | "team:read"
  | "team:invite"
  | "team:edit"
  | "team:deactivate";

export type Permission = ContentPermission | TeamPermission;

/**
 * Role-based permission mapping.
 * Defines which permissions each role has.
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Content
    "content:read",
    "content:create",
    "content:edit",
    "content:publish",
    "content:delete",
    // Team
    "team:read",
    "team:invite",
    "team:edit",
    "team:deactivate",
  ],
  EDITOR: [
    // Content
    "content:read",
    "content:create",
    "content:edit",
    "content:publish",
    "content:delete",
    // Team - editors can only view team
    "team:read",
  ],
  VIEWER: [
    // Read-only
    "content:read",
    "team:read",
  ],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role can manage team members (Admin only).
 */
export function canManageTeam(role: UserRole): boolean {
  return role === "ADMIN";
}

/**
 * Check if a role can create/edit content (Admin or Editor).
 */
export function canEditContent(role: UserRole): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

/**
 * Check if a role can publish/unpublish content (Admin or Editor).
 */
export function canPublishContent(role: UserRole): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

/**
 * Check if a role can delete content (Admin or Editor).
 */
export function canDeleteContent(role: UserRole): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

/**
 * Get human-readable role label for UI.
 * Uses church-friendly language.
 */
export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "EDITOR":
      return "Editor";
    case "VIEWER":
      return "Viewer";
    default:
      return "Unknown";
  }
}

/**
 * Get role description for UI.
 */
export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "Full access to all content and team management";
    case "EDITOR":
      return "Can create, edit, and publish content";
    case "VIEWER":
      return "Can view content in the dashboard";
    default:
      return "";
  }
}

/**
 * All available roles for selection dropdowns.
 */
export const ALL_ROLES: UserRole[] = ["ADMIN", "EDITOR", "VIEWER"];
