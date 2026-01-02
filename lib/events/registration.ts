/**
 * Event Registration Service
 *
 * Handles all registration-related operations including:
 * - Creating registrations with capacity and waitlist management
 * - Cancelling registrations and promoting from waitlist
 * - Check-in/out functionality
 * - Capacity status queries
 */

import { RegistrationStatus } from "@prisma/client";
import { logger } from "@/lib/logging/logger";

// Type for tenant-scoped Prisma client (extends base PrismaClient)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TenantPrismaClient = any;

// Registration input for public registration
export interface RegistrationInput {
  eventId: string;
  occurrenceDate?: Date;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  additionalAttendees?: number;
  customFields?: Record<string, unknown>;
  reminderOptIn?: boolean;
}

// Result of registration attempt
export interface RegistrationResult {
  success: boolean;
  registration?: {
    id: string;
    status: RegistrationStatus;
    waitlistPosition: number | null;
    accessToken: string;
  };
  error?: string;
  errorCode?: "CAPACITY_FULL" | "ALREADY_REGISTERED" | "DEADLINE_PASSED" | "NOT_ENABLED" | "UNKNOWN";
}

// Capacity status for an event
export interface CapacityStatus {
  registrationEnabled: boolean;
  capacity: number | null;
  registered: number;
  waitlisted: number;
  available: number | null;
  waitlistEnabled: boolean;
  isFull: boolean;
  deadlinePassed: boolean;
}

/**
 * Get the capacity status for an event (optionally for a specific occurrence)
 */
export async function getCapacityStatus(
  db: TenantPrismaClient,
  eventId: string,
  occurrenceDate?: Date
): Promise<CapacityStatus> {
  // Get event details
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      registrationEnabled: true,
      capacity: true,
      waitlistEnabled: true,
      registrationDeadline: true,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // Count registrations for this event/occurrence
  const whereClause: {
    eventId: string;
    occurrenceDate?: Date | null;
    status: { in: RegistrationStatus[] };
  } = {
    eventId,
    status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN] },
  };

  // If occurrence date is provided, filter by it; otherwise get all
  if (occurrenceDate) {
    whereClause.occurrenceDate = occurrenceDate;
  }

  const registered = await db.eventRegistration.count({
    where: whereClause,
  });

  // Count waitlisted separately
  const waitlistWhere = {
    ...whereClause,
    status: RegistrationStatus.WAITLISTED,
  };
  const waitlisted = await db.eventRegistration.count({
    where: waitlistWhere,
  });

  const available = event.capacity ? Math.max(0, event.capacity - registered) : null;
  const isFull = event.capacity ? registered >= event.capacity : false;
  const deadlinePassed = event.registrationDeadline
    ? new Date() > event.registrationDeadline
    : false;

  return {
    registrationEnabled: event.registrationEnabled,
    capacity: event.capacity,
    registered,
    waitlisted,
    available,
    waitlistEnabled: event.waitlistEnabled,
    isFull,
    deadlinePassed,
  };
}

/**
 * Create a new registration for an event
 */
export async function createRegistration(
  db: TenantPrismaClient,
  churchId: string,
  input: RegistrationInput
): Promise<RegistrationResult> {
  try {
    // Get event with registration settings
    const event = await db.event.findFirst({
      where: { id: input.eventId, churchId },
    });

    if (!event) {
      return { success: false, error: "Event not found", errorCode: "UNKNOWN" };
    }

    // Check if registration is enabled
    if (!event.registrationEnabled) {
      return {
        success: false,
        error: "Registration is not enabled for this event",
        errorCode: "NOT_ENABLED",
      };
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return {
        success: false,
        error: "Registration deadline has passed",
        errorCode: "DEADLINE_PASSED",
      };
    }

    // Check for existing registration
    const existingRegistration = await db.eventRegistration.findFirst({
      where: {
        eventId: input.eventId,
        email: input.email.toLowerCase(),
        occurrenceDate: input.occurrenceDate || null,
        status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.WAITLISTED, RegistrationStatus.CHECKED_IN] },
      },
    });

    if (existingRegistration) {
      return {
        success: false,
        error: "You are already registered for this event",
        errorCode: "ALREADY_REGISTERED",
      };
    }

    // Get capacity status
    const capacityStatus = await getCapacityStatus(db, input.eventId, input.occurrenceDate);

    // Determine registration status
    let status: RegistrationStatus = RegistrationStatus.REGISTERED;
    let waitlistPosition: number | null = null;

    if (capacityStatus.isFull) {
      if (!event.waitlistEnabled) {
        return {
          success: false,
          error: "Event is at full capacity",
          errorCode: "CAPACITY_FULL",
        };
      }
      // Add to waitlist
      status = RegistrationStatus.WAITLISTED;
      waitlistPosition = capacityStatus.waitlisted + 1;
    }

    // Create registration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registration = await (db.eventRegistration.create as any)({
      data: {
        churchId,
        eventId: input.eventId,
        occurrenceDate: input.occurrenceDate || null,
        email: input.email.toLowerCase(),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || null,
        additionalAttendees: input.additionalAttendees || 0,
        customFields: input.customFields || null,
        status,
        waitlistPosition,
        reminderOptIn: input.reminderOptIn ?? true,
      },
    });

    logger.info("Event registration created", {
      eventId: input.eventId,
      registrationId: registration.id,
      status,
      waitlistPosition,
    });

    return {
      success: true,
      registration: {
        id: registration.id,
        status: registration.status,
        waitlistPosition: registration.waitlistPosition,
        accessToken: registration.accessToken,
      },
    };
  } catch (error) {
    logger.error("Failed to create registration", error as Error);
    return { success: false, error: "Failed to create registration", errorCode: "UNKNOWN" };
  }
}

/**
 * Cancel a registration and promote the next person from waitlist
 */
export async function cancelRegistration(
  db: TenantPrismaClient,
  registrationId: string,
  accessToken?: string
): Promise<{ success: boolean; error?: string; promotedRegistration?: string }> {
  try {
    // Find registration
    const whereClause: { id: string; accessToken?: string } = { id: registrationId };
    if (accessToken) {
      whereClause.accessToken = accessToken;
    }

    const registration = await db.eventRegistration.findFirst({
      where: whereClause,
      include: { event: true },
    });

    if (!registration) {
      return { success: false, error: "Registration not found" };
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      return { success: false, error: "Registration is already cancelled" };
    }

    const wasRegistered = registration.status === RegistrationStatus.REGISTERED ||
      registration.status === RegistrationStatus.CHECKED_IN;

    // Cancel the registration
    await db.eventRegistration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.CANCELLED },
    });

    logger.info("Event registration cancelled", { registrationId });

    // If was registered (not waitlisted), promote next from waitlist
    let promotedRegistrationId: string | undefined;
    if (wasRegistered && registration.event.waitlistEnabled) {
      const nextWaitlisted = await db.eventRegistration.findFirst({
        where: {
          eventId: registration.eventId,
          occurrenceDate: registration.occurrenceDate,
          status: RegistrationStatus.WAITLISTED,
        },
        orderBy: { waitlistPosition: "asc" },
      });

      if (nextWaitlisted) {
        await db.eventRegistration.update({
          where: { id: nextWaitlisted.id },
          data: {
            status: RegistrationStatus.REGISTERED,
            waitlistPosition: null,
          },
        });

        promotedRegistrationId = nextWaitlisted.id;

        // Decrement waitlist positions for remaining
        await db.eventRegistration.updateMany({
          where: {
            eventId: registration.eventId,
            occurrenceDate: registration.occurrenceDate,
            status: RegistrationStatus.WAITLISTED,
          },
          data: {
            waitlistPosition: { decrement: 1 },
          },
        });

        logger.info("Promoted from waitlist", {
          promotedId: nextWaitlisted.id,
          eventId: registration.eventId,
        });
      }
    }

    return {
      success: true,
      promotedRegistration: promotedRegistrationId,
    };
  } catch (error) {
    logger.error("Failed to cancel registration", error as Error);
    return { success: false, error: "Failed to cancel registration" };
  }
}

/**
 * Check in a registration
 */
export async function checkInRegistration(
  db: TenantPrismaClient,
  registrationId: string,
  checkedInBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const registration = await db.eventRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return { success: false, error: "Registration not found" };
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      return { success: false, error: "Cannot check in a cancelled registration" };
    }

    if (registration.status === RegistrationStatus.CHECKED_IN) {
      return { success: false, error: "Already checked in" };
    }

    await db.eventRegistration.update({
      where: { id: registrationId },
      data: {
        status: RegistrationStatus.CHECKED_IN,
        checkedInAt: new Date(),
        checkedInBy,
      },
    });

    logger.info("Registration checked in", { registrationId, checkedInBy });

    return { success: true };
  } catch (error) {
    logger.error("Failed to check in registration", error as Error);
    return { success: false, error: "Failed to check in" };
  }
}

/**
 * Undo check-in (revert to registered)
 */
export async function undoCheckIn(
  db: TenantPrismaClient,
  registrationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const registration = await db.eventRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return { success: false, error: "Registration not found" };
    }

    if (registration.status !== RegistrationStatus.CHECKED_IN) {
      return { success: false, error: "Registration is not checked in" };
    }

    await db.eventRegistration.update({
      where: { id: registrationId },
      data: {
        status: RegistrationStatus.REGISTERED,
        checkedInAt: null,
        checkedInBy: null,
      },
    });

    logger.info("Check-in undone", { registrationId });

    return { success: true };
  } catch (error) {
    logger.error("Failed to undo check-in", error as Error);
    return { success: false, error: "Failed to undo check-in" };
  }
}

/**
 * Get registration by access token (for self-service)
 */
export async function getRegistrationByToken(
  db: TenantPrismaClient,
  accessToken: string
) {
  return db.eventRegistration.findUnique({
    where: { accessToken },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          location: true,
          venue: true,
        },
      },
    },
  });
}

/**
 * Mark a registration as no-show (for post-event cleanup)
 */
export async function markAsNoShow(
  db: TenantPrismaClient,
  registrationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const registration = await db.eventRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return { success: false, error: "Registration not found" };
    }

    if (registration.status !== RegistrationStatus.REGISTERED) {
      return { success: false, error: "Can only mark registered (not checked-in) as no-show" };
    }

    await db.eventRegistration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.NO_SHOW },
    });

    logger.info("Registration marked as no-show", { registrationId });

    return { success: true };
  } catch (error) {
    logger.error("Failed to mark as no-show", error as Error);
    return { success: false, error: "Failed to mark as no-show" };
  }
}

/**
 * Get registration stats for an event
 */
export async function getRegistrationStats(
  db: TenantPrismaClient,
  eventId: string,
  occurrenceDate?: Date
) {
  const whereBase = {
    eventId,
    occurrenceDate: occurrenceDate || null,
  };

  const [registered, waitlisted, checkedIn, cancelled, noShow] = await Promise.all([
    db.eventRegistration.count({
      where: { ...whereBase, status: RegistrationStatus.REGISTERED },
    }),
    db.eventRegistration.count({
      where: { ...whereBase, status: RegistrationStatus.WAITLISTED },
    }),
    db.eventRegistration.count({
      where: { ...whereBase, status: RegistrationStatus.CHECKED_IN },
    }),
    db.eventRegistration.count({
      where: { ...whereBase, status: RegistrationStatus.CANCELLED },
    }),
    db.eventRegistration.count({
      where: { ...whereBase, status: RegistrationStatus.NO_SHOW },
    }),
  ]);

  // Get total additional attendees for registered/checked-in
  const totalAttendees = await db.eventRegistration.aggregate({
    where: {
      ...whereBase,
      status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN] },
    },
    _sum: { additionalAttendees: true },
  });

  return {
    registered,
    waitlisted,
    checkedIn,
    cancelled,
    noShow,
    totalAttendees: registered + checkedIn + (totalAttendees._sum.additionalAttendees || 0),
  };
}
