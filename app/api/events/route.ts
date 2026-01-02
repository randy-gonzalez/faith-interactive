/**
 * Events API Routes
 *
 * GET /api/events - List all events for the church
 * POST /api/events - Create a new event
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { eventExtendedSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

export async function GET() {
  try {
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const events = await db.event.findMany({
      orderBy: { startDate: "desc" },
      include: {
        venue: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch events", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const body = await request.json();
    const result = eventExtendedSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // churchId is automatically injected by tenant-prisma extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = await (db.event.create as any)({
      data: {
        title: result.data.title,
        description: result.data.description || null,
        startDate: new Date(result.data.startDate),
        endDate: result.data.endDate ? new Date(result.data.endDate) : null,
        venueId: result.data.venueId || null,
        location: result.data.location || null,
        registrationUrl: result.data.registrationUrl || null,
        featuredImageUrl: result.data.featuredImageUrl || null,
        featuredMediaId: result.data.featuredMediaId || null,
        // Registration settings
        registrationEnabled: result.data.registrationEnabled ?? false,
        capacity: result.data.capacity || null,
        waitlistEnabled: result.data.waitlistEnabled ?? false,
        registrationDeadline: result.data.registrationDeadline
          ? new Date(result.data.registrationDeadline)
          : null,
        // Recurrence settings
        isRecurring: result.data.isRecurring ?? false,
        recurrenceFrequency: result.data.recurrenceFrequency || null,
        recurrenceInterval: result.data.recurrenceInterval || null,
        recurrenceDaysOfWeek: result.data.recurrenceDaysOfWeek || null,
        recurrenceDayOfMonth: result.data.recurrenceDayOfMonth || null,
        recurrenceEndDate: result.data.recurrenceEndDate
          ? new Date(result.data.recurrenceEndDate)
          : null,
        recurrenceCount: result.data.recurrenceCount || null,
        timezone: result.data.timezone || "America/New_York",
        status: "DRAFT",
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to create event", error as Error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
