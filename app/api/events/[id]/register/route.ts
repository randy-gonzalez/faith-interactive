/**
 * Event Registration API Routes (Public)
 *
 * POST /api/events/[id]/register - Register for an event
 * GET /api/events/[id]/register - Get registration status (by token)
 * DELETE /api/events/[id]/register - Cancel registration (by token)
 *
 * Security:
 * - Honeypot field detection
 * - Rate limiting per IP
 * - Access token for self-service operations
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";
import { eventRegistrationSchema, formatZodError } from "@/lib/validation/schemas";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/security/rate-limit";
import {
  createRegistration,
  cancelRegistration,
  getRegistrationByToken,
  getCapacityStatus,
} from "@/lib/events/registration";
import {
  sendRegistrationConfirmationEmail,
  sendWaitlistConfirmationEmail,
} from "@/lib/email/registration-emails";
import { RegistrationStatus } from "@prisma/client";

// Rate limit: 10 registrations per hour per IP
const REGISTRATION_RATE_LIMIT = {
  max: 10,
  windowSeconds: 3600,
};

/**
 * POST /api/events/[id]/register
 * Register for an event (public endpoint)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const headerStore = await headers();
    const churchSlug = headerStore.get("x-church-slug");

    if (!churchSlug) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Get church from slug
    const church = await prisma.church.findUnique({
      where: { slug: churchSlug },
    });

    if (!church) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    // Verify event exists and belongs to this church
    const db = getTenantPrisma(church.id);
    const event = await db.event.findFirst({
      where: { id: eventId, churchId: church.id, status: "PUBLISHED" },
      include: { venue: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.registrationEnabled) {
      return NextResponse.json(
        { error: "Registration is not enabled for this event" },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const forwardedFor = headerStore.get("x-forwarded-for");
    const realIp = headerStore.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

    // Check rate limit
    const rateLimitResult = checkRateLimit(
      clientIp,
      `/api/events/register:${church.id}`,
      REGISTRATION_RATE_LIMIT
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body = await request.json();

    // Check honeypot field
    if (body.website && body.website.length > 0) {
      logger.warn("Honeypot triggered on event registration", {
        churchId: church.id,
        eventId,
        ip: clientIp,
      });
      // Return success to not tip off the bot
      return NextResponse.json(
        { success: true, message: "Registration successful!" },
        { headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate input
    const parseResult = eventRegistrationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: formatZodError(parseResult.error) },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const data = parseResult.data;

    // Create registration
    const result = await createRegistration(db, church.id, {
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
      const statusCode = result.errorCode === "ALREADY_REGISTERED" ? 409 : 400;
      return NextResponse.json(
        { error: result.error },
        {
          status: statusCode,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Send confirmation email
    const locationText = event.venue
      ? `${event.venue.name}${event.venue.address ? `, ${event.venue.address}` : ""}`
      : event.location || "";

    try {
      if (result.registration?.status === RegistrationStatus.WAITLISTED) {
        await sendWaitlistConfirmationEmail(
          data.email,
          church.name,
          data.firstName,
          event.title,
          event.startDate,
          locationText,
          result.registration.waitlistPosition || 0,
          result.registration.accessToken
        );
      } else {
        await sendRegistrationConfirmationEmail(
          data.email,
          church.name,
          data.firstName,
          event.title,
          event.startDate,
          event.endDate,
          locationText,
          result.registration!.accessToken
        );
      }
    } catch (emailError) {
      logger.error("Failed to send registration email", emailError as Error);
    }

    logger.info("Event registration created", {
      churchId: church.id,
      eventId,
      registrationId: result.registration?.id,
      status: result.registration?.status,
    });

    return NextResponse.json(
      {
        success: true,
        registration: {
          id: result.registration?.id,
          status: result.registration?.status,
          waitlistPosition: result.registration?.waitlistPosition,
        },
        message:
          result.registration?.status === RegistrationStatus.WAITLISTED
            ? `You've been added to the waitlist at position ${result.registration.waitlistPosition}. We'll notify you if a spot opens up.`
            : "Registration successful! Check your email for confirmation.",
      },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    logger.error("Event registration failed", error as Error);
    return NextResponse.json(
      { error: "Failed to complete registration. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/events/[id]/register?token=X
 * Get registration status by access token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const headerStore = await headers();
    const churchSlug = headerStore.get("x-church-slug");
    const token = request.nextUrl.searchParams.get("token");

    if (!churchSlug) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    if (!token) {
      // No token - return capacity status
      const church = await prisma.church.findUnique({
        where: { slug: churchSlug },
      });

      if (!church) {
        return NextResponse.json(
          { error: "Church not found" },
          { status: 404 }
        );
      }

      const db = getTenantPrisma(church.id);
      const event = await db.event.findFirst({
        where: { id: eventId, churchId: church.id },
      });

      if (!event) {
        return NextResponse.json(
          { error: "Event not found" },
          { status: 404 }
        );
      }

      const status = await getCapacityStatus(db, eventId);
      return NextResponse.json({ capacityStatus: status });
    }

    // Get church from slug
    const church = await prisma.church.findUnique({
      where: { slug: churchSlug },
    });

    if (!church) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    const db = getTenantPrisma(church.id);
    const registration = await getRegistrationByToken(db, token);

    if (!registration || registration.eventId !== eventId) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      registration: {
        id: registration.id,
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        status: registration.status,
        waitlistPosition: registration.waitlistPosition,
        checkedInAt: registration.checkedInAt,
        event: registration.event,
      },
    });
  } catch (error) {
    logger.error("Failed to get registration", error as Error);
    return NextResponse.json(
      { error: "Failed to get registration" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]/register?token=X
 * Cancel registration by access token
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const headerStore = await headers();
    const churchSlug = headerStore.get("x-church-slug");
    const token = request.nextUrl.searchParams.get("token");

    if (!churchSlug || !token) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const church = await prisma.church.findUnique({
      where: { slug: churchSlug },
    });

    if (!church) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    const db = getTenantPrisma(church.id);

    // Verify the registration belongs to this event
    const registration = await db.eventRegistration.findUnique({
      where: { accessToken: token },
    });

    if (!registration || registration.eventId !== eventId) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const result = await cancelRegistration(db, registration.id, token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    logger.info("Event registration cancelled", {
      churchId: church.id,
      eventId,
      registrationId: registration.id,
    });

    return NextResponse.json({
      success: true,
      message: "Your registration has been cancelled.",
    });
  } catch (error) {
    logger.error("Failed to cancel registration", error as Error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}
