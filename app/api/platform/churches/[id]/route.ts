/**
 * Church Detail API Routes
 *
 * GET /api/platform/churches/[id] - Get church details
 * PATCH /api/platform/churches/[id] - Update church
 * DELETE /api/platform/churches/[id] - Soft delete church
 *
 * Platform admin only for write operations.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { platformAuditLog } from "@/lib/audit/platform-audit-log";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";
import { formatZodError } from "@/lib/validation/schemas";

type RouteParams = { params: Promise<{ id: string }> };

// Validation schema for updating a church
const updateChurchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens only")
    .transform((s) => s.toLowerCase())
    .optional(),
  primaryContactEmail: z.string().email().optional().nullable(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
});

/**
 * GET /api/platform/churches/[id]
 * Get detailed information about a church.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePlatformUser();
    const { id } = await params;

    const church = await prisma.church.findUnique({
      where: { id },
      include: {
        siteSettings: true,
        _count: {
          select: {
            memberships: { where: { isActive: true } }, // Count active members
            pages: { where: { status: "PUBLISHED" } },
            sermons: { where: { status: "PUBLISHED" } },
            events: { where: { status: "PUBLISHED" } },
            announcements: { where: { status: "PUBLISHED" } },
            leadershipProfiles: { where: { status: "PUBLISHED" } },
            customDomains: true,
            redirectRules: true,
            media: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Get last updated content timestamp
    const [latestPage, latestSermon] = await Promise.all([
      prisma.page.findFirst({
        where: { churchId: id },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.sermon.findFirst({
        where: { churchId: id },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]);

    const lastContentUpdate = [latestPage?.updatedAt, latestSermon?.updatedAt]
      .filter(Boolean)
      .sort((a, b) => (b?.getTime() || 0) - (a?.getTime() || 0))[0] || null;

    return NextResponse.json({
      church: {
        ...church,
        lastContentUpdate,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to get church", error as Error);
    return NextResponse.json(
      { error: "Failed to get church" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/churches/[id]
 * Update a church.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePlatformAdmin();
    const { id } = await params;

    const body = await request.json();
    const result = updateChurchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    // Check church exists
    const existing = await prisma.church.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, status: true, primaryContactEmail: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const { name, slug, primaryContactEmail, status } = result.data;

    // If changing slug, check it's not taken
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.church.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A church with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (primaryContactEmail !== undefined) updateData.primaryContactEmail = primaryContactEmail;
    if (status !== undefined) updateData.status = status;

    // Update church
    const church = await prisma.church.update({
      where: { id },
      data: updateData,
    });

    // Determine audit action
    let auditAction: "CHURCH_UPDATED" | "CHURCH_SUSPENDED" | "CHURCH_UNSUSPENDED" = "CHURCH_UPDATED";
    if (status === "SUSPENDED" && existing.status === "ACTIVE") {
      auditAction = "CHURCH_SUSPENDED";
    } else if (status === "ACTIVE" && existing.status === "SUSPENDED") {
      auditAction = "CHURCH_UNSUSPENDED";
    }

    // Audit log
    await platformAuditLog.logChurchAction(
      user.id,
      user.email,
      auditAction,
      church.id,
      {
        changes: {
          ...(name !== undefined && name !== existing.name && { name: { from: existing.name, to: name } }),
          ...(slug !== undefined && slug !== existing.slug && { slug: { from: existing.slug, to: slug } }),
          ...(status !== undefined && status !== existing.status && { status: { from: existing.status, to: status } }),
        },
      }
    );

    logger.info("Church updated", {
      churchId: church.id,
      updatedBy: user.email,
    });

    return NextResponse.json({ church });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to update church", error as Error);
    return NextResponse.json(
      { error: "Failed to update church" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/churches/[id]
 * Soft delete a church.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePlatformAdmin();
    const { id } = await params;

    // Check church exists
    const existing = await prisma.church.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, deletedAt: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    if (existing.deletedAt) {
      return NextResponse.json(
        { error: "Church is already deleted" },
        { status: 400 }
      );
    }

    // Soft delete - set deletedAt timestamp
    await prisma.church.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Audit log
    await platformAuditLog.logChurchAction(
      user.id,
      user.email,
      "CHURCH_DELETED",
      id,
      { name: existing.name, slug: existing.slug }
    );

    logger.info("Church deleted", {
      churchId: id,
      deletedBy: user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to delete church", error as Error);
    return NextResponse.json(
      { error: "Failed to delete church" },
      { status: 500 }
    );
  }
}
