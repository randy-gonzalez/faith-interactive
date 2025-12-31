/**
 * Audit Logs API Routes
 *
 * GET /api/audit-logs - List audit logs for the church (Admin only)
 *
 * Query parameters:
 * - limit: Number of entries to return (default 50, max 200)
 * - offset: Number of entries to skip (default 0)
 * - action: Filter by action type
 * - entityType: Filter by entity type
 * - actorUserId: Filter by actor user ID
 * - startDate: Filter by start date (ISO string)
 * - endDate: Filter by end date (ISO string)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";
import { AuditAction, AuditEntityType, Prisma } from "@prisma/client";

/**
 * GET /api/audit-logs
 * List audit logs for the church.
 * Admin only - sensitive data.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const { searchParams } = request.nextUrl;

    // Parse pagination
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "50", 10), 1),
      200
    );
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    // Parse filters
    const action = searchParams.get("action") as AuditAction | null;
    const entityType = searchParams.get("entityType") as AuditEntityType | null;
    const actorUserId = searchParams.get("actorUserId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: Prisma.AuditLogWhereInput = {
      churchId: user.churchId,
    };

    if (action && Object.values(AuditAction).includes(action)) {
      where.action = action;
    }

    if (entityType && Object.values(AuditEntityType).includes(entityType)) {
      where.entityType = entityType;
    }

    if (actorUserId) {
      where.actorUserId = actorUserId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        try {
          where.createdAt.gte = new Date(startDate);
        } catch {
          // Invalid date, ignore
        }
      }
      if (endDate) {
        try {
          where.createdAt.lte = new Date(endDate);
        } catch {
          // Invalid date, ignore
        }
      }
    }

    const db = getTenantPrisma(user.churchId);

    // Get logs with count
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + logs.length < total,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    logger.error("Failed to list audit logs", error as Error);
    return NextResponse.json(
      { error: "Failed to list audit logs" },
      { status: 500 }
    );
  }
}
