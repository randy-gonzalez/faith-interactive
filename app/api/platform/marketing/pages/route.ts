/**
 * Marketing Pages API Routes
 *
 * GET /api/platform/marketing/pages - List all marketing pages
 * POST /api/platform/marketing/pages - Create a new marketing page
 *
 * Platform admin only for write operations.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { platformAuditLog } from "@/lib/audit/platform-audit-log";
import { logger } from "@/lib/logging/logger";
import { marketingPageSchema, formatZodError } from "@/lib/validation/schemas";

/**
 * GET /api/platform/marketing/pages
 * List all marketing pages.
 */
export async function GET() {
  try {
    await requirePlatformUser();

    const pages = await prisma.marketingPage.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        parentId: true,
        sortOrder: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to list marketing pages", error as Error);
    return NextResponse.json(
      { error: "Failed to list marketing pages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/marketing/pages
 * Create a new marketing page.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const result = marketingPageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const {
      title,
      slug,
      blocks,
      parentId,
      sortOrder,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      noIndex,
      status,
    } = result.data;

    // Check if slug is already taken
    const existing = await prisma.marketingPage.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 409 }
      );
    }

    // Validate parentId if provided
    if (parentId) {
      const parentPage = await prisma.marketingPage.findUnique({
        where: { id: parentId },
      });
      if (!parentPage) {
        return NextResponse.json(
          { error: "Parent page not found" },
          { status: 400 }
        );
      }
    }

    // Create the page
    const page = await prisma.marketingPage.create({
      data: {
        title,
        slug,
        blocks: (blocks || []) as unknown as object,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        ogImage: ogImage || null,
        noIndex: noIndex || false,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    // Audit log
    await platformAuditLog.logMarketingPageAction(
      user.id,
      user.email,
      "MARKETING_PAGE_CREATED",
      page.id,
      { title, slug, status, parentId }
    );

    logger.info("Marketing page created", {
      pageId: page.id,
      slug,
      createdBy: user.email,
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to create marketing page", error as Error);
    return NextResponse.json(
      { error: "Failed to create marketing page" },
      { status: 500 }
    );
  }
}
