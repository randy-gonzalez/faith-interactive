/**
 * Venues API Routes
 *
 * GET /api/venues - List all venues for the church
 * POST /api/venues - Create a new venue
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { venueSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

export async function GET() {
  try {
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const venues = await db.venue.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ venues });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch venues", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const body = await request.json();
    const result = venueSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // churchId is automatically injected by tenant-prisma extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const venue = await (db.venue.create as any)({
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

    return NextResponse.json({ venue }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to create venue", error as Error);
    return NextResponse.json(
      { error: "Failed to create venue" },
      { status: 500 }
    );
  }
}
