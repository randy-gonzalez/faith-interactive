/**
 * Single Sermon API Routes
 *
 * GET /api/sermons/[id] - Get sermon by ID
 * PUT /api/sermons/[id] - Update sermon
 * DELETE /api/sermons/[id] - Delete sermon
 * PATCH /api/sermons/[id] - Publish/unpublish sermon
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { prisma } from "@/lib/db/prisma";
import { sermonSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const sermon = await db.sermon.findUnique({
      where: { id },
      include: {
        speaker: true,
        series: true,
        topics: {
          include: {
            topic: true,
          },
        },
        scriptureReferences: {
          include: {
            book: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
    }

    return NextResponse.json({ sermon });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch sermon", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch sermon" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.sermon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = sermonSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Use a transaction to update sermon with relations
    const sermon = await prisma.$transaction(async (tx) => {
      // Update the sermon
      await tx.sermon.update({
        where: { id },
        data: {
          title: data.title,
          date: new Date(data.date),
          speakerId: data.speakerId || null,
          speakerName: data.speakerId ? null : data.speakerName || null,
          seriesId: data.seriesId || null,
          seriesOrder: data.seriesOrder || null,
          scripture: data.scripture || null,
          description: data.description || null,
          notes: data.notes || null,
          videoUrl: data.videoUrl || null,
          audioUrl: data.audioUrl || null,
          artworkUrl: data.artworkUrl || null,
        },
      });

      // Update scripture references - delete existing and recreate
      await tx.scriptureReference.deleteMany({
        where: { sermonId: id },
      });

      if (data.scriptureReferences && data.scriptureReferences.length > 0) {
        await tx.scriptureReference.createMany({
          data: data.scriptureReferences.map((ref, index) => ({
            sermonId: id,
            bookId: ref.bookId,
            startChapter: ref.startChapter,
            startVerse: ref.startVerse || null,
            endChapter: ref.endChapter || null,
            endVerse: ref.endVerse || null,
            sortOrder: index,
          })),
        });
      }

      // Update topic links - delete existing and recreate
      await tx.sermonTopicLink.deleteMany({
        where: { sermonId: id },
      });

      if (data.topicIds && data.topicIds.length > 0) {
        await tx.sermonTopicLink.createMany({
          data: data.topicIds.map((topicId) => ({
            sermonId: id,
            topicId,
          })),
        });
      }

      // Return sermon with relations
      return tx.sermon.findUnique({
        where: { id },
        include: {
          speaker: true,
          series: true,
          topics: {
            include: { topic: true },
          },
          scriptureReferences: {
            include: { book: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    });

    return NextResponse.json({ sermon });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update sermon", error as Error);
    return NextResponse.json(
      { error: "Failed to update sermon" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.sermon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
    }

    // Delete related records first (cascade should handle this, but be explicit)
    await prisma.$transaction(async (tx) => {
      await tx.scriptureReference.deleteMany({
        where: { sermonId: id },
      });
      await tx.sermonTopicLink.deleteMany({
        where: { sermonId: id },
      });
      await tx.sermon.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to delete sermon", error as Error);
    return NextResponse.json(
      { error: "Failed to delete sermon" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.sermon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "publish") {
      const sermon = await db.sermon.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      return NextResponse.json({ sermon });
    }

    if (action === "unpublish") {
      const sermon = await db.sermon.update({
        where: { id },
        data: {
          status: "DRAFT",
          publishedAt: null,
        },
      });
      return NextResponse.json({ sermon });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update sermon status", error as Error);
    return NextResponse.json(
      { error: "Failed to update sermon status" },
      { status: 500 }
    );
  }
}
