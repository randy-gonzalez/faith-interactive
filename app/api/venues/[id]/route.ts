/**
 * Venue Detail API Routes
 *
 * GET /api/venues/[id] - Get a single venue
 * PUT /api/venues/[id] - Update a venue
 * DELETE /api/venues/[id] - Soft delete a venue (set isActive=false)
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { venueSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const venue = await db.venue.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    return NextResponse.json({ venue });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch venue", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch venue" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    // Check venue exists
    const existing = await db.venue.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = venueSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const venue = await db.venue.update({
      where: { id },
      data: {
        name: result.data.name,
        address: result.data.address || null,
        city: result.data.city || null,
        state: result.data.state || null,
        zipCode: result.data.zipCode || null,
        capacity: result.data.capacity || null,
        notes: result.data.notes || null,
        sortOrder: result.data.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ venue });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update venue", error as Error);
    return NextResponse.json(
      { error: "Failed to update venue" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    // Check venue exists
    const existing = await db.venue.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    // Soft delete - set isActive to false
    await db.venue.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to delete venue", error as Error);
    return NextResponse.json(
      { error: "Failed to delete venue" },
      { status: 500 }
    );
  }
}
