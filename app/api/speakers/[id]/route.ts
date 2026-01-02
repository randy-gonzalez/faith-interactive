/**
 * Single Speaker API Routes
 *
 * GET /api/speakers/[id] - Get speaker by ID
 * PUT /api/speakers/[id] - Update speaker
 * DELETE /api/speakers/[id] - Delete speaker
 * PATCH /api/speakers/[id] - Publish/unpublish or reorder
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { speakerSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const speaker = await db.speaker.findUnique({
      where: { id },
    });

    if (!speaker) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 });
    }

    return NextResponse.json({ speaker });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch speaker", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch speaker" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.speaker.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = speakerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const speaker = await db.speaker.update({
      where: { id },
      data: {
        name: result.data.name,
        title: result.data.title || null,
        bio: result.data.bio || null,
        photoUrl: result.data.photoUrl || null,
        email: result.data.email || null,
        sortOrder: result.data.sortOrder ?? existing.sortOrder,
        isGuest: result.data.isGuest ?? existing.isGuest,
      },
    });

    return NextResponse.json({ speaker });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update speaker", error as Error);
    return NextResponse.json(
      { error: "Failed to update speaker" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.speaker.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 });
    }

    await db.speaker.delete({
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
    logger.error("Failed to delete speaker", error as Error);
    return NextResponse.json(
      { error: "Failed to delete speaker" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.speaker.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action, sortOrder } = body;

    if (action === "publish") {
      const speaker = await db.speaker.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      return NextResponse.json({ speaker });
    }

    if (action === "unpublish") {
      const speaker = await db.speaker.update({
        where: { id },
        data: {
          status: "DRAFT",
          publishedAt: null,
        },
      });
      return NextResponse.json({ speaker });
    }

    if (action === "reorder" && typeof sortOrder === "number") {
      const speaker = await db.speaker.update({
        where: { id },
        data: { sortOrder },
      });
      return NextResponse.json({ speaker });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update speaker", error as Error);
    return NextResponse.json(
      { error: "Failed to update speaker" },
      { status: 500 }
    );
  }
}
