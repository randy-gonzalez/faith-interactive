/**
 * Blog Category Detail API Routes
 *
 * GET /api/platform/marketing/blog/categories/[id] - Get a single category
 * PATCH /api/platform/marketing/blog/categories/[id] - Update a category
 * DELETE /api/platform/marketing/blog/categories/[id] - Delete a category
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";
import { blogCategorySchema, formatZodError } from "@/lib/validation/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/platform/marketing/blog/categories/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePlatformUser();
    const { id } = await params;

    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to get blog category", error as Error);
    return NextResponse.json(
      { error: "Failed to get blog category" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/marketing/blog/categories/[id]
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePlatformAdmin();
    const { id } = await params;

    const existing = await prisma.blogCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = blogCategorySchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const { name, slug, description, sortOrder } = result.data;

    // Check if new slug conflicts
    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.blogCategory.findUnique({
        where: { slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    logger.info("Blog category updated", { categoryId: id });

    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to update blog category", error as Error);
    return NextResponse.json(
      { error: "Failed to update blog category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/marketing/blog/categories/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePlatformAdmin();
    const { id } = await params;

    const existing = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (existing._count.posts > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with posts. Remove posts first or move them to another category." },
        { status: 400 }
      );
    }

    await prisma.blogCategory.delete({
      where: { id },
    });

    logger.info("Blog category deleted", { categoryId: id, slug: existing.slug });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to delete blog category", error as Error);
    return NextResponse.json(
      { error: "Failed to delete blog category" },
      { status: 500 }
    );
  }
}
