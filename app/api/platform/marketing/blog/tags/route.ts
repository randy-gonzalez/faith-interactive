/**
 * Blog Tags API Routes
 *
 * GET /api/platform/marketing/blog/tags - List all tags
 * POST /api/platform/marketing/blog/tags - Create a new tag
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";
import { blogTagSchema, formatZodError } from "@/lib/validation/schemas";

/**
 * GET /api/platform/marketing/blog/tags
 * List all blog tags.
 */
export async function GET() {
  try {
    await requirePlatformUser();

    const tags = await prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to list blog tags", error as Error);
    return NextResponse.json(
      { error: "Failed to list blog tags" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/marketing/blog/tags
 * Create a new blog tag.
 */
export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const body = await request.json();
    const result = blogTagSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const { name, slug } = result.data;

    // Check if slug is already taken
    const existing = await prisma.blogTag.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A tag with this slug already exists" },
        { status: 409 }
      );
    }

    const tag = await prisma.blogTag.create({
      data: {
        name,
        slug,
      },
    });

    logger.info("Blog tag created", { tagId: tag.id, slug });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to create blog tag", error as Error);
    return NextResponse.json(
      { error: "Failed to create blog tag" },
      { status: 500 }
    );
  }
}
