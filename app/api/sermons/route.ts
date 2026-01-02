/**
 * Sermons API Routes
 *
 * GET /api/sermons - List all sermons for the church
 * POST /api/sermons - Create a new sermon
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { prisma } from "@/lib/db/prisma";
import { sermonSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

export async function GET() {
  try {
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const sermons = await db.sermon.findMany({
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({ sermons });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch sermons", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch sermons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const body = await request.json();
    const result = sermonSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Use a transaction to create sermon with relations
    const sermon = await prisma.$transaction(async (tx) => {
      // Create the sermon
      const newSermon = await tx.sermon.create({
        data: {
          churchId,
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
          status: "DRAFT",
        },
      });

      // Create scripture references
      if (data.scriptureReferences && data.scriptureReferences.length > 0) {
        await tx.scriptureReference.createMany({
          data: data.scriptureReferences.map((ref, index) => ({
            sermonId: newSermon.id,
            bookId: ref.bookId,
            startChapter: ref.startChapter,
            startVerse: ref.startVerse || null,
            endChapter: ref.endChapter || null,
            endVerse: ref.endVerse || null,
            sortOrder: index,
          })),
        });
      }

      // Create topic links
      if (data.topicIds && data.topicIds.length > 0) {
        await tx.sermonTopicLink.createMany({
          data: data.topicIds.map((topicId) => ({
            sermonId: newSermon.id,
            topicId,
          })),
        });
      }

      // Return sermon with relations
      return tx.sermon.findUnique({
        where: { id: newSermon.id },
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

    return NextResponse.json({ sermon }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to create sermon", error as Error);
    return NextResponse.json(
      { error: "Failed to create sermon" },
      { status: 500 }
    );
  }
}
