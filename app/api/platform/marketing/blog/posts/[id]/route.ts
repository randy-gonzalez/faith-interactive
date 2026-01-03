/**
 * Blog Post Detail API Routes
 *
 * GET /api/platform/marketing/blog/posts/[id] - Get a single blog post
 * PATCH /api/platform/marketing/blog/posts/[id] - Update a blog post
 * DELETE /api/platform/marketing/blog/posts/[id] - Delete a blog post
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";
import { blogPostSchema, formatZodError } from "@/lib/validation/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/platform/marketing/blog/posts/[id]
 * Get a single blog post by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePlatformUser();
    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Flatten tags
    const formattedPost = {
      ...post,
      tags: post.tags.map((t) => t.tag),
    };

    return NextResponse.json({ post: formattedPost });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to get blog post", error as Error);
    return NextResponse.json(
      { error: "Failed to get blog post" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/marketing/blog/posts/[id]
 * Update a blog post.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePlatformAdmin();
    const { id } = await params;

    const existing = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = blogPostSchema.partial().safeParse(body);

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

    // Check if new slug conflicts
    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.blogPost.findUnique({
        where: { slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: "A blog post with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Determine publishedAt
    let publishedAt = existing.publishedAt;
    if (status === "PUBLISHED" && !existing.publishedAt) {
      publishedAt = new Date();
    }

    // Update the post
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(excerpt !== undefined && { excerpt: excerpt || null }),
        ...(blocks !== undefined && { blocks: blocks as unknown as object }),
        ...(featuredImage !== undefined && { featuredImage: featuredImage || null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(authorName !== undefined && { authorName: authorName || null }),
        ...(status !== undefined && { status, publishedAt }),
        ...(metaTitle !== undefined && { metaTitle: metaTitle || null }),
        ...(metaDescription !== undefined && { metaDescription: metaDescription || null }),
        ...(ogImage !== undefined && { ogImage: ogImage || null }),
        ...(noIndex !== undefined && { noIndex }),
      },
    });

    // Update tags if provided
    if (tagIds !== undefined) {
      // Remove existing tags
      await prisma.blogPostTag.deleteMany({
        where: { postId: id },
      });
      // Add new tags
      if (tagIds.length > 0) {
        await prisma.blogPostTag.createMany({
          data: tagIds.map((tagId) => ({
            postId: id,
            tagId,
          })),
        });
      }
    }

    // Fetch updated post with relations
    const updatedPost = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    logger.info("Blog post updated", {
      postId: id,
      updatedBy: user.email,
    });

    return NextResponse.json({
      post: {
        ...updatedPost,
        tags: updatedPost?.tags.map((t) => t.tag) || [],
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to update blog post", error as Error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/marketing/blog/posts/[id]
 * Delete a blog post.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePlatformAdmin();
    const { id } = await params;

    const existing = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    logger.info("Blog post deleted", {
      postId: id,
      slug: existing.slug,
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
    logger.error("Failed to delete blog post", error as Error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
