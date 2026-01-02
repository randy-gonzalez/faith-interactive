/**
 * Marketing Page Detail API Routes
 *
 * GET /api/platform/marketing/pages/[id] - Get page details
 * PATCH /api/platform/marketing/pages/[id] - Update page
 * DELETE /api/platform/marketing/pages/[id] - Delete page
 *
 * Platform admin only for write operations.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { platformAuditLog } from "@/lib/audit/platform-audit-log";
import { logger } from "@/lib/logging/logger";
import { marketingPageSchema, formatZodError } from "@/lib/validation/schemas";

type RouteParams = { params: Promise<{ id: string }> };

// Make all fields optional for PATCH
const updatePageSchema = marketingPageSchema.partial();

/**
 * GET /api/platform/marketing/pages/[id]
 * Get detailed information about a marketing page.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePlatformUser();
    const { id } = await params;

    const page = await prisma.marketingPage.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to get marketing page", error as Error);
    return NextResponse.json(
      { error: "Failed to get marketing page" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/marketing/pages/[id]
 * Update a marketing page.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePlatformAdmin();
    const { id } = await params;

    const body = await request.json();
    const result = updatePageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    // Check page exists
    const existing = await prisma.marketingPage.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
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

    // If changing slug, check it's not taken
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.marketingPage.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A page with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Validate parentId if provided
    if (parentId !== undefined && parentId !== null) {
      // Cannot set self as parent
      if (parentId === id) {
        return NextResponse.json(
          { error: "A page cannot be its own parent" },
          { status: 400 }
        );
      }
      // Parent must exist
      const parentPage = await prisma.marketingPage.findUnique({
        where: { id: parentId },
      });
      if (!parentPage) {
        return NextResponse.json(
          { error: "Parent page not found" },
          { status: 400 }
        );
      }
      // Prevent circular references
      let currentParent = parentPage;
      while (currentParent.parentId) {
        if (currentParent.parentId === id) {
          return NextResponse.json(
            { error: "Cannot create circular parent reference" },
            { status: 400 }
          );
        }
        const nextParent = await prisma.marketingPage.findUnique({
          where: { id: currentParent.parentId },
        });
        if (!nextParent) break;
        currentParent = nextParent;
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (blocks !== undefined) updateData.blocks = blocks;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle || null;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription || null;
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords || null;
    if (ogImage !== undefined) updateData.ogImage = ogImage || null;
    if (noIndex !== undefined) updateData.noIndex = noIndex;
    if (status !== undefined) {
      updateData.status = status;
      // Set publishedAt when first publishing
      if (status === "PUBLISHED" && existing.status === "DRAFT") {
        updateData.publishedAt = new Date();
      }
    }

    // Update page
    const page = await prisma.marketingPage.update({
      where: { id },
      data: updateData,
    });

    // Determine audit action
    let auditAction: "MARKETING_PAGE_UPDATED" | "MARKETING_PAGE_PUBLISHED" | "MARKETING_PAGE_UNPUBLISHED" =
      "MARKETING_PAGE_UPDATED";
    if (status === "PUBLISHED" && existing.status === "DRAFT") {
      auditAction = "MARKETING_PAGE_PUBLISHED";
    } else if (status === "DRAFT" && existing.status === "PUBLISHED") {
      auditAction = "MARKETING_PAGE_UNPUBLISHED";
    }

    // Audit log
    await platformAuditLog.logMarketingPageAction(
      user.id,
      user.email,
      auditAction,
      page.id,
      {
        changes: {
          ...(title !== undefined && title !== existing.title && { title: { from: existing.title, to: title } }),
          ...(slug !== undefined && slug !== existing.slug && { slug: { from: existing.slug, to: slug } }),
          ...(status !== undefined && status !== existing.status && { status: { from: existing.status, to: status } }),
        },
      }
    );

    logger.info("Marketing page updated", {
      pageId: page.id,
      updatedBy: user.email,
    });

    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to update marketing page", error as Error);
    return NextResponse.json(
      { error: "Failed to update marketing page" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/marketing/pages/[id]
 * Delete a marketing page.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePlatformAdmin();
    const { id } = await params;

    // Check page exists
    const existing = await prisma.marketingPage.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Delete the page
    await prisma.marketingPage.delete({
      where: { id },
    });

    // Audit log
    await platformAuditLog.logMarketingPageAction(
      user.id,
      user.email,
      "MARKETING_PAGE_DELETED",
      id,
      { title: existing.title, slug: existing.slug }
    );

    logger.info("Marketing page deleted", {
      pageId: id,
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
    logger.error("Failed to delete marketing page", error as Error);
    return NextResponse.json(
      { error: "Failed to delete marketing page" },
      { status: 500 }
    );
  }
}
