/**
 * Sermon Series API Routes
 *
 * GET /api/sermon-series - List all sermon series for the church
 * POST /api/sermon-series - Create a new sermon series
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { sermonSeriesSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

export async function GET() {
  try {
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const series = await db.sermonSeries.findMany({
      orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
      include: {
        _count: {
          select: { sermons: true },
        },
      },
    });

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

export async function POST(request: Request) {
  try {
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const body = await request.json();
    const result = sermonSeriesSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Get the highest sort order to add new series at the end
    const lastSeries = await db.sermonSeries.findFirst({
      orderBy: { sortOrder: "desc" },
    });
    const sortOrder = result.data.sortOrder ?? (lastSeries?.sortOrder || 0) + 1;

    // churchId is automatically injected by tenant-prisma extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const series = await (db.sermonSeries.create as any)({
      data: {
        name: result.data.name,
        description: result.data.description || null,
        artworkUrl: result.data.artworkUrl || null,
        startDate: result.data.startDate ? new Date(result.data.startDate) : null,
        endDate: result.data.endDate ? new Date(result.data.endDate) : null,
        sortOrder,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ series }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to create sermon series", error as Error);
    return NextResponse.json(
      { error: "Failed to create sermon series" },
      { status: 500 }
    );
  }
}
