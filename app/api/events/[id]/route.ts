/**
 * Single Event API Routes
 *
 * GET /api/events/[id] - Get event by ID
 * PUT /api/events/[id] - Update event
 * DELETE /api/events/[id] - Delete event
 * PATCH /api/events/[id] - Publish/unpublish event
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { eventExtendedSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const event = await db.event.findUnique({
      where: { id },
      include: {
        venue: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch event", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.event.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = eventExtendedSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const event = await db.event.update({
      where: { id },
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
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update event", error as Error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.event.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await db.event.delete({
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
    logger.error("Failed to delete event", error as Error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.event.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "publish") {
      const event = await db.event.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      return NextResponse.json({ event });
    }

    if (action === "unpublish") {
      const event = await db.event.update({
        where: { id },
        data: {
          status: "DRAFT",
          publishedAt: null,
        },
      });
      return NextResponse.json({ event });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update event status", error as Error);
    return NextResponse.json(
      { error: "Failed to update event status" },
      { status: 500 }
    );
  }
}
