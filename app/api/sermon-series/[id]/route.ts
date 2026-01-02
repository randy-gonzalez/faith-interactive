/**
 * Single Sermon Series API Routes
 *
 * GET /api/sermon-series/[id] - Get series by ID
 * PUT /api/sermon-series/[id] - Update series
 * DELETE /api/sermon-series/[id] - Delete series
 * PATCH /api/sermon-series/[id] - Publish/unpublish or reorder
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { sermonSeriesSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const series = await db.sermonSeries.findUnique({
      where: { id },
      include: {
        sermons: {
          orderBy: { seriesOrder: "asc" },
          select: {
            id: true,
            title: true,
            date: true,
            seriesOrder: true,
            status: true,
          },
        },
      },
    });

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    return NextResponse.json({ series });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch sermon series", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch sermon series" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.sermonSeries.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = sermonSeriesSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const series = await db.sermonSeries.update({
      where: { id },
      data: {
        name: result.data.name,
        description: result.data.description || null,
        artworkUrl: result.data.artworkUrl || null,
        startDate: result.data.startDate ? new Date(result.data.startDate) : null,
        endDate: result.data.endDate ? new Date(result.data.endDate) : null,
        sortOrder: result.data.sortOrder ?? existing.sortOrder,
      },
    });

    return NextResponse.json({ series });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update sermon series", error as Error);
    return NextResponse.json(
      { error: "Failed to update sermon series" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.sermonSeries.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sermons: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    // Warn if series has sermons
    if (existing._count.sermons > 0) {
      // Unlink sermons from this series rather than blocking delete
      await db.sermon.updateMany({
        where: { seriesId: id },
        data: { seriesId: null, seriesOrder: null },
      });
    }

    await db.sermonSeries.delete({
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
    logger.error("Failed to delete sermon series", error as Error);
    return NextResponse.json(
      { error: "Failed to delete sermon series" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.sermonSeries.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action, sortOrder } = body;

    if (action === "publish") {
      const series = await db.sermonSeries.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      return NextResponse.json({ series });
    }

    if (action === "unpublish") {
      const series = await db.sermonSeries.update({
        where: { id },
        data: {
          status: "DRAFT",
          publishedAt: null,
        },
      });
      return NextResponse.json({ series });
    }

    if (action === "reorder" && typeof sortOrder === "number") {
      const series = await db.sermonSeries.update({
        where: { id },
        data: { sortOrder },
      });
      return NextResponse.json({ series });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update sermon series", error as Error);
    return NextResponse.json(
      { error: "Failed to update sermon series" },
      { status: 500 }
    );
  }
}
