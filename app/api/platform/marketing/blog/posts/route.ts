/**
 * Blog Posts API Routes
 *
 * GET /api/platform/marketing/blog/posts - List all blog posts
 * POST /api/platform/marketing/blog/posts - Create a new blog post
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";
import { blogPostSchema, formatZodError } from "@/lib/validation/schemas";

/**
 * GET /api/platform/marketing/blog/posts
 * List all blog posts with optional filters.
 */
export async function GET(request: NextRequest) {
  try {
    await requirePlatformUser();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        authorName: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Flatten tags structure
    const formattedPosts = posts.map((post) => ({
      ...post,
      tags: post.tags.map((t) => t.tag),
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to list blog posts", error as Error);
    return NextResponse.json(
      { error: "Failed to list blog posts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/marketing/blog/posts
 * Create a new blog post.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const result = blogPostSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const {
      title,
      slug,
      excerpt,
      blocks,
      featuredImage,
      categoryId,
      tagIds,
      authorName,
      status,
      metaTitle,
      metaDescription,
      ogImage,
      noIndex,
    } = result.data;

    // Check if slug is already taken
    const existing = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A blog post with this slug already exists" },
        { status: 409 }
      );
    }

    // Validate categoryId if provided
    if (categoryId) {
      const category = await prisma.blogCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400 }
        );
      }
    }

    // Create the post with tags
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        blocks: (blocks || []) as unknown as object,
        featuredImage: featuredImage || null,
        categoryId: categoryId || null,
        authorId: user.id,
        authorName: authorName || user.name || user.email,
        status: status || "DRAFT",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
        noIndex: noIndex || false,
        tags: tagIds && tagIds.length > 0
          ? {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    logger.info("Blog post created", {
      postId: post.id,
      slug,
      createdBy: user.email,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to create blog post", error as Error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
