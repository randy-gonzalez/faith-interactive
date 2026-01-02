/**
 * Single Sermon Topic API Routes
 *
 * GET /api/sermon-topics/[id] - Get topic by ID
 * PUT /api/sermon-topics/[id] - Update topic
 * DELETE /api/sermon-topics/[id] - Delete topic
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { sermonTopicSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const topic = await db.sermonTopic.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sermons: true },
        },
      },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ topic });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch sermon topic", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch sermon topic" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.sermonTopic.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = sermonTopicSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Check if new slug already exists (if changed)
    if (result.data.slug !== existing.slug) {
      const slugExists = await db.sermonTopic.findFirst({
        where: { slug: result.data.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A topic with this slug already exists", details: { fieldErrors: { slug: ["Slug already in use"] } } },
          { status: 400 }
        );
      }
    }

    const topic = await db.sermonTopic.update({
      where: { id },
      data: {
        name: result.data.name,
        slug: result.data.slug,
        description: result.data.description || null,
      },
    });

    return NextResponse.json({ topic });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update sermon topic", error as Error);
    return NextResponse.json(
      { error: "Failed to update sermon topic" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.sermonTopic.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Delete topic (SermonTopicLink entries will cascade)
    await db.sermonTopic.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to delete sermon topic", error as Error);
    return NextResponse.json(
      { error: "Failed to delete sermon topic" },
      { status: 500 }
    );
  }
}
