/**
 * Event Registrations API Routes (Admin)
 *
 * GET /api/events/[id]/registrations - List all registrations for an event
 * POST /api/events/[id]/registrations - Create a registration (admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { eventRegistrationSchema, formatZodError } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import { createRegistration, getRegistrationStats } from "@/lib/events/registration";
import { RegistrationStatus } from "@prisma/client";

/**
 * GET /api/events/[id]/registrations
 * List all registrations for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    // Parse query params
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") as RegistrationStatus | null;
    const occurrenceDate = searchParams.get("occurrenceDate");
    const search = searchParams.get("search");

    // Verify event exists
    const event = await db.event.findFirst({
      where: { id: eventId, churchId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { eventId };

    if (status) {
      where.status = status;
    }

    if (occurrenceDate) {
      where.occurrenceDate = new Date(occurrenceDate);
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get registrations
    const registrations = await db.eventRegistration.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { waitlistPosition: "asc" },
        { registeredAt: "asc" },
      ],
    });

    // Get stats
    const stats = await getRegistrationStats(
      db,
      eventId,
      occurrenceDate ? new Date(occurrenceDate) : undefined
    );

    return NextResponse.json({
      registrations,
      stats,
      event: {
        id: event.id,
        title: event.title,
        capacity: event.capacity,
        waitlistEnabled: event.waitlistEnabled,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to fetch registrations", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/[id]/registrations
 * Create a registration (admin bypass capacity checks)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    // Verify event exists
    const event = await db.event.findFirst({
      where: { id: eventId, churchId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parseResult = eventRegistrationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: formatZodError(parseResult.error) },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Create registration (using service but admin can bypass)
    const result = await createRegistration(db, churchId, {
      eventId,
      occurrenceDate: data.occurrenceDate ? new Date(data.occurrenceDate) : undefined,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone ?? undefined,
      additionalAttendees: data.additionalAttendees ?? undefined,
      reminderOptIn: data.reminderOptIn ?? undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    logger.info("Admin created registration", {
      eventId,
      registrationId: result.registration?.id,
    });

    return NextResponse.json(
      { registration: result.registration },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to create registration", error as Error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}
