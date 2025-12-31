/**
 * Audit Log Service
 *
 * Provides centralized audit logging for sensitive admin actions.
 * Logs are immutable once written.
 *
 * USAGE:
 * ```typescript
 * import { auditLog } from "@/lib/audit/audit-log";
 *
 * await auditLog.log({
 *   churchId: "church_123",
 *   actorUserId: "user_456",
 *   actorEmail: "admin@example.com",
 *   action: "USER_ROLE_CHANGED",
 *   entityType: "USER",
 *   entityId: "user_789",
 *   metadata: { oldRole: "VIEWER", newRole: "EDITOR" },
 * });
 * ```
 */

import { prisma } from "@/lib/db/prisma";
import { AuditAction, AuditEntityType, Prisma } from "@prisma/client";
import { logger } from "@/lib/logging/logger";
import { getRequestContextFromHeaders } from "@/lib/logging/request-context";

/**
 * Parameters for creating an audit log entry
 */
export interface AuditLogParams {
  /** Church/tenant ID */
  churchId: string;
  /** User who performed the action (null for system/anonymous) */
  actorUserId?: string | null;
  /** Actor's email at time of action (for historical record) */
  actorEmail?: string | null;
  /** Actor's IP address */
  actorIp?: string | null;
  /** The action performed */
  action: AuditAction;
  /** Type of entity affected */
  entityType: AuditEntityType;
  /** ID of the affected entity */
  entityId?: string | null;
  /** Additional context (JSON serializable) */
  metadata?: Record<string, unknown> | null;
  /** Request ID for correlation */
  requestId?: string | null;
  /** User agent string */
  userAgent?: string | null;
}

/**
 * Audit log service
 */
export const auditLog = {
  /**
   * Create an audit log entry
   * This operation is fire-and-forget to avoid blocking the main request
   */
  async log(params: AuditLogParams): Promise<void> {
    try {
      // Get request context if not provided
      let requestId = params.requestId;
      let userAgent = params.userAgent;

      if (!requestId || !userAgent) {
        try {
          const ctx = await getRequestContextFromHeaders();
          requestId = requestId || ctx.requestId;
          userAgent = userAgent || ctx.userAgent;
        } catch {
          // Context not available, continue without it
        }
      }

      await prisma.auditLog.create({
        data: {
          churchId: params.churchId,
          actorUserId: params.actorUserId ?? null,
          actorEmail: params.actorEmail ?? null,
          actorIp: params.actorIp ?? null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId ?? null,
          // Prisma requires explicit InputJsonValue or DbNull for JSON fields
          metadata: params.metadata
            ? (params.metadata as Prisma.InputJsonValue)
            : Prisma.DbNull,
          requestId: requestId ?? null,
          userAgent: userAgent ?? null,
        },
      });

      logger.debug("Audit log entry created", {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
      });
    } catch (error) {
      // Log but don't throw - audit logging should never break the main flow
      logger.error("Failed to create audit log entry", error as Error, {
        action: params.action,
        entityType: params.entityType,
        churchId: params.churchId,
      });
    }
  },

  /**
   * Log a user management action
   */
  async logUserAction(
    churchId: string,
    actorUserId: string,
    actorEmail: string,
    action: Extract<AuditAction, "USER_INVITED" | "USER_ROLE_CHANGED" | "USER_DEACTIVATED" | "USER_REACTIVATED">,
    targetUserId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      churchId,
      actorUserId,
      actorEmail,
      action,
      entityType: "USER",
      entityId: targetUserId,
      metadata,
    });
  },

  /**
   * Log a content lifecycle action
   */
  async logContentAction(
    churchId: string,
    actorUserId: string,
    actorEmail: string,
    action: Extract<AuditAction, "CONTENT_PUBLISHED" | "CONTENT_UNPUBLISHED" | "CONTENT_DELETED">,
    entityType: Extract<AuditEntityType, "PAGE" | "SERMON" | "EVENT" | "ANNOUNCEMENT" | "LEADERSHIP_PROFILE">,
    entityId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      churchId,
      actorUserId,
      actorEmail,
      action,
      entityType,
      entityId,
      metadata,
    });
  },

  /**
   * Log a domain management action
   */
  async logDomainAction(
    churchId: string,
    actorUserId: string,
    actorEmail: string,
    action: Extract<AuditAction, "DOMAIN_ADDED" | "DOMAIN_VERIFIED" | "DOMAIN_REMOVED">,
    domainId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      churchId,
      actorUserId,
      actorEmail,
      action,
      entityType: "CUSTOM_DOMAIN",
      entityId: domainId,
      metadata,
    });
  },

  /**
   * Log a redirect management action
   */
  async logRedirectAction(
    churchId: string,
    actorUserId: string,
    actorEmail: string,
    action: Extract<AuditAction, "REDIRECT_CREATED" | "REDIRECT_UPDATED" | "REDIRECT_DELETED">,
    redirectId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      churchId,
      actorUserId,
      actorEmail,
      action,
      entityType: "REDIRECT_RULE",
      entityId: redirectId,
      metadata,
    });
  },

  /**
   * Log a settings update action
   */
  async logSettingsAction(
    churchId: string,
    actorUserId: string,
    actorEmail: string,
    action: Extract<AuditAction, "SETTINGS_UPDATED" | "MAINTENANCE_MODE_ENABLED" | "MAINTENANCE_MODE_DISABLED">,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      churchId,
      actorUserId,
      actorEmail,
      action,
      entityType: "SITE_SETTINGS",
      entityId: churchId,
      metadata,
    });
  },

  /**
   * Log an authentication event
   */
  async logAuthEvent(
    churchId: string,
    action: Extract<AuditAction, "LOGIN_SUCCESS" | "LOGIN_FAILED" | "LOGOUT" | "PASSWORD_RESET_REQUESTED" | "PASSWORD_RESET_COMPLETED">,
    userEmail: string,
    userId?: string | null,
    actorIp?: string | null,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      churchId,
      actorUserId: userId,
      actorEmail: userEmail,
      actorIp,
      action,
      entityType: "SESSION",
      metadata,
    });
  },
};

// Re-export types for convenience
export { AuditAction, AuditEntityType };
