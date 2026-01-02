/**
 * Single Event Registration API Routes (Admin)
 *
 * GET /api/events/[id]/registrations/[regId] - Get single registration
 * PUT /api/events/[id]/registrations/[regId] - Update registration
 * DELETE /api/events/[id]/registrations/[regId] - Cancel registration
 * PATCH /api/events/[id]/registrations/[regId] - Check-in/out
 */

import { NextRequest, NextResponse } from "next/server";
import { requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { registrationUpdateSchema, formatZodError } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import {
  cancelRegistration,
  checkInRegistration,
  undoCheckIn,
  markAsNoShow,
} from "@/lib/events/registration";
import { RegistrationStatus } from "@prisma/client";

/**
 * GET /api/events/[id]/registrations/[regId]
 * Get a single registration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> }
) {
  try {
    const { id: eventId, regId } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const registration = await db.eventRegistration.findFirst({
      where: { id: regId, eventId, churchId },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ registration });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to fetch registration", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch registration" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[id]/registrations/[regId]
 * Update registration details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> }
) {
  try {
    const { id: eventId, regId } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    // Verify registration exists
    const existing = await db.eventRegistration.findFirst({
      where: { id: regId, eventId, churchId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parseResult = registrationUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: formatZodError(parseResult.error) },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const registration = await db.eventRegistration.update({
      where: { id: regId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        additionalAttendees: data.additionalAttendees,
        reminderOptIn: data.reminderOptIn,
      },
    });

    logger.info("Registration updated", { registrationId: regId });

    return NextResponse.json({ registration });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update registration", error as Error);
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]/registrations/[regId]
 * Cancel a registration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> }
) {
  try {
    const { id: eventId, regId } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    // Verify registration exists
    const existing = await db.eventRegistration.findFirst({
      where: { id: regId, eventId, churchId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const result = await cancelRegistration(db, regId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    logger.info("Registration cancelled by admin", { registrationId: regId });

    return NextResponse.json({
      success: true,
      promotedRegistration: result.promotedRegistration,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to cancel registration", error as Error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/events/[id]/registrations/[regId]
 * Check-in, undo check-in, or mark as no-show
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> }
) {
  try {
    const { id: eventId, regId } = await params;
    const user = await requireContentEditor();
    const { churchId, id: userId } = user;
    const db = getTenantPrisma(churchId);

    // Verify registration exists
    const existing = await db.eventRegistration.findFirst({
      where: { id: regId, eventId, churchId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const action = body.action as "check_in" | "undo_check_in" | "no_show";

    if (!action || !["check_in", "undo_check_in", "no_show"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be: check_in, undo_check_in, or no_show" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "check_in":
        result = await checkInRegistration(db, regId, userId);
        break;
      case "undo_check_in":
        result = await undoCheckIn(db, regId);
        break;
      case "no_show":
        result = await markAsNoShow(db, regId);
        break;
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Fetch updated registration
    const registration = await db.eventRegistration.findUnique({
      where: { id: regId },
    });

    logger.info(`Registration ${action}`, { registrationId: regId, userId });

    return NextResponse.json({ success: true, registration });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update registration status", error as Error);
    return NextResponse.json(
      { error: "Failed to update registration status" },
      { status: 500 }
    );
  }
}
