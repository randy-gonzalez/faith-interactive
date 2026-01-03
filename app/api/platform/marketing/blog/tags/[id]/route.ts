/**
 * Blog Tag Detail API Routes
 *
 * DELETE /api/platform/marketing/blog/tags/[id] - Delete a tag
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/platform/marketing/blog/tags/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePlatformAdmin();
    const { id } = await params;

    const existing = await prisma.blogTag.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Delete tag (cascade will remove BlogPostTag relations)
    await prisma.blogTag.delete({
      where: { id },
    });

    logger.info("Blog tag deleted", { tagId: id, slug: existing.slug });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to delete blog tag", error as Error);
    return NextResponse.json(
      { error: "Failed to delete blog tag" },
      { status: 500 }
    );
  }
}
