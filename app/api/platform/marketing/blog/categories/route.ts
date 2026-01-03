/**
 * Blog Categories API Routes
 *
 * GET /api/platform/marketing/blog/categories - List all categories
 * POST /api/platform/marketing/blog/categories - Create a new category
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";
import { blogCategorySchema, formatZodError } from "@/lib/validation/schemas";

/**
 * GET /api/platform/marketing/blog/categories
 * List all blog categories.
 */
export async function GET() {
  try {
    await requirePlatformUser();

    const categories = await prisma.blogCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to list blog categories", error as Error);
    return NextResponse.json(
      { error: "Failed to list blog categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/marketing/blog/categories
 * Create a new blog category.
 */
export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const body = await request.json();
    const result = blogCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const { name, slug, description, sortOrder } = result.data;

    // Check if slug is already taken
    const existing = await prisma.blogCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        sortOrder: sortOrder || 0,
      },
    });

    logger.info("Blog category created", { categoryId: category.id, slug });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to create blog category", error as Error);
    return NextResponse.json(
      { error: "Failed to create blog category" },
      { status: 500 }
    );
  }
}
