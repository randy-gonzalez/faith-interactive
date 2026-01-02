/**
 * Platform Audit Log Service
 *
 * Logs sensitive platform-level admin actions performed by Fi staff.
 * This is SEPARATE from the tenant-scoped AuditLog.
 *
 * USAGE:
 * ```typescript
 * import { platformAuditLog } from "@/lib/audit/platform-audit-log";
 *
 * await platformAuditLog.log({
 *   actorUserId: "user_456",
 *   actorEmail: "admin@faithinteractive.com",
 *   action: "CHURCH_CREATED",
 *   entityType: "CHURCH",
 *   entityId: "church_789",
 *   targetChurchId: "church_789",
 *   metadata: { churchName: "Grace Community" },
 * });
 * ```
 */

import { prisma } from "@/lib/db/prisma";
import { PlatformAuditAction, PlatformEntityType, Prisma } from "@prisma/client";
import { logger } from "@/lib/logging/logger";
import { getRequestContextFromHeaders } from "@/lib/logging/request-context";

/**
 * Parameters for creating a platform audit log entry
 */
export interface PlatformAuditLogParams {
  /** Platform user who performed the action */
  actorUserId: string;
  /** Actor's email at time of action */
  actorEmail: string;
  /** Actor's IP address */
  actorIp?: string | null;
  /** The action performed */
  action: PlatformAuditAction;
  /** Type of entity affected */
  entityType: PlatformEntityType;
  /** ID of the affected entity */
  entityId?: string | null;
  /** For church-related actions, which church */
  targetChurchId?: string | null;
  /** Additional context (JSON serializable) */
  metadata?: Record<string, unknown> | null;
  /** Request ID for correlation */
  requestId?: string | null;
  /** User agent string */
  userAgent?: string | null;
}

/**
 * Platform audit log service
 */
export const platformAuditLog = {
  /**
   * Create a platform audit log entry
   */
  async log(params: PlatformAuditLogParams): Promise<void> {
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

      await prisma.platformAuditLog.create({
        data: {
          actorUserId: params.actorUserId,
          actorEmail: params.actorEmail,
          actorIp: params.actorIp ?? null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId ?? null,
          targetChurchId: params.targetChurchId ?? null,
          metadata: params.metadata
            ? (params.metadata as Prisma.InputJsonValue)
            : Prisma.DbNull,
          requestId: requestId ?? null,
          userAgent: userAgent ?? null,
        },
      });

      logger.debug("Platform audit log entry created", {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        targetChurchId: params.targetChurchId,
      });
    } catch (error) {
      // Log but don't throw - audit logging should never break the main flow
      logger.error("Failed to create platform audit log entry", error as Error, {
        action: params.action,
        entityType: params.entityType,
        actorUserId: params.actorUserId,
      });
    }
  },

  /**
   * Log a church management action
   */
  async logChurchAction(
    actorUserId: string,
    actorEmail: string,
    action: Extract<
      PlatformAuditAction,
      | "CHURCH_CREATED"
      | "CHURCH_UPDATED"
      | "CHURCH_SUSPENDED"
      | "CHURCH_UNSUSPENDED"
      | "CHURCH_DELETED"
    >,
    churchId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      actorUserId,
      actorEmail,
      action,
      entityType: "CHURCH",
      entityId: churchId,
      targetChurchId: churchId,
      metadata,
    });
  },

  /**
   * Log a church user management action
   */
  async logChurchUserAction(
    actorUserId: string,
    actorEmail: string,
    action: Extract<
      PlatformAuditAction,
      "CHURCH_USER_INVITED" | "CHURCH_USER_ROLE_CHANGED" | "CHURCH_USER_DEACTIVATED"
    >,
    targetUserId: string,
    churchId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      actorUserId,
      actorEmail,
      action,
      entityType: "CHURCH_USER",
      entityId: targetUserId,
      targetChurchId: churchId,
      metadata,
    });
  },

  /**
   * Log a church domain management action
   */
  async logChurchDomainAction(
    actorUserId: string,
    actorEmail: string,
    action: Extract<
      PlatformAuditAction,
      "CHURCH_DOMAIN_ADDED" | "CHURCH_DOMAIN_VERIFIED" | "CHURCH_DOMAIN_REMOVED"
    >,
    domainId: string,
    churchId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      actorUserId,
      actorEmail,
      action,
      entityType: "CHURCH_DOMAIN",
      entityId: domainId,
      targetChurchId: churchId,
      metadata,
    });
  },

  /**
   * Log a marketing page action
   */
  async logMarketingPageAction(
    actorUserId: string,
    actorEmail: string,
    action: Extract<
      PlatformAuditAction,
      | "MARKETING_PAGE_CREATED"
      | "MARKETING_PAGE_UPDATED"
      | "MARKETING_PAGE_PUBLISHED"
      | "MARKETING_PAGE_UNPUBLISHED"
      | "MARKETING_PAGE_DELETED"
    >,
    pageId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      actorUserId,
      actorEmail,
      action,
      entityType: "MARKETING_PAGE",
      entityId: pageId,
      metadata,
    });
  },

  /**
   * Log a marketing settings update
   */
  async logMarketingSettingsAction(
    actorUserId: string,
    actorEmail: string,
    settingsId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      actorUserId,
      actorEmail,
      action: "MARKETING_SETTINGS_UPDATED",
      entityType: "MARKETING_SETTINGS",
      entityId: settingsId,
      metadata,
    });
  },

  /**
   * Log an impersonation event
   */
  async logImpersonation(
    actorUserId: string,
    actorEmail: string,
    action: "IMPERSONATION_STARTED" | "IMPERSONATION_ENDED",
    targetChurchId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.log({
      actorUserId,
      actorEmail,
      action,
      entityType: "SESSION",
      targetChurchId,
      metadata,
    });
  },
};

// Re-export types for convenience
export { PlatformAuditAction, PlatformEntityType };
