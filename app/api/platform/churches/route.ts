/**
 * Church Management API Routes
 *
 * GET /api/platform/churches - List all churches
 * POST /api/platform/churches - Create a new church
 *
 * Platform admin only.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { platformAuditLog } from "@/lib/audit/platform-audit-log";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";
import { formatZodError } from "@/lib/validation/schemas";

// Validation schema for creating a church
const createChurchSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase alphanumeric with hyphens only"
    )
    .transform((s) => s.toLowerCase()),
  primaryContactEmail: z.string().email().optional().nullable(),
});

/**
 * GET /api/platform/churches
 * List all churches with optional search/filter.
 */
export async function GET(request: NextRequest) {
  try {
    // Any platform user can view churches
    await requirePlatformUser();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (status === "ACTIVE" || status === "SUSPENDED") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const churches = await prisma.church.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        primaryContactEmail: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        _count: {
          select: {
            memberships: { where: { isActive: true } },
            pages: true,
            customDomains: true,
          },
        },
      },
    });

    return NextResponse.json({ churches });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to list churches", error as Error);
    return NextResponse.json(
      { error: "Failed to list churches" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/churches
 * Create a new church (tenant).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const result = createChurchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const { name, slug, primaryContactEmail } = result.data;

    // Check if slug is already taken
    const existing = await prisma.church.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A church with this slug already exists" },
        { status: 409 }
      );
    }

    // Create the church with default site settings
    const church = await prisma.church.create({
      data: {
        name,
        slug,
        primaryContactEmail: primaryContactEmail || null,
        // Create default site settings
        siteSettings: {
          create: {
            metaTitle: name,
            metaDescription: `Welcome to ${name}`,
          },
        },
      },
      include: {
        siteSettings: true,
      },
    });

    // Initialize default launch checklist items
    const defaultChecklistItems = [
      "domain_added",
      "ssl_active",
      "content_reviewed",
      "contact_info_added",
      "test_forms",
      "mobile_tested",
    ];

    await prisma.launchChecklistItem.createMany({
      data: defaultChecklistItems.map((itemKey) => ({
        churchId: church.id,
        itemKey,
        isComplete: false,
      })),
    });

    // Audit log
    await platformAuditLog.logChurchAction(
      user.id,
      user.email,
      "CHURCH_CREATED",
      church.id,
      { name, slug, primaryContactEmail }
    );

    logger.info("Church created", {
      churchId: church.id,
      slug,
      createdBy: user.email,
    });

    return NextResponse.json({ church }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to create church", error as Error);
    return NextResponse.json(
      { error: "Failed to create church" },
      { status: 500 }
    );
  }
}
