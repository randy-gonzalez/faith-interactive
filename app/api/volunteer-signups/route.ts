/**
 * Volunteer Signup API Routes
 *
 * POST /api/volunteer-signups - Submit a volunteer signup (public, rate-limited)
 * GET /api/volunteer-signups - List volunteer signups (admin/editor only)
 *
 * Security measures:
 * - Honeypot field detection
 * - Rate limiting per IP
 * - Input validation
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";
import { volunteerSignupSchema, formatZodError } from "@/lib/validation/schemas";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/security/rate-limit";
import { sendVolunteerSignupNotificationEmail } from "@/lib/email/send";
import { requireContentEditor, AuthError } from "@/lib/auth/guards";
import type { ApiResponse } from "@/types";

// Rate limit: 3 volunteer signups per hour per IP
const VOLUNTEER_SIGNUP_RATE_LIMIT = {
  max: 3,
  windowSeconds: 3600, // 1 hour
};

/**
 * Helper to parse comma-separated emails into array
 */
function parseNotificationEmails(emailsString: string | null): string[] {
  if (!emailsString) return [];
  return emailsString
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.includes("@"));
}

/**
 * POST /api/volunteer-signups
 * Submit a volunteer signup. Public endpoint with rate limiting.
 */
export async function POST(request: Request) {
  try {
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
      include: {
        siteSettings: true,
      },
    });

    if (!church) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    // Get client IP for rate limiting
    const forwardedFor = headerStore.get("x-forwarded-for");
    const realIp = headerStore.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

    // Check rate limit
    const rateLimitResult = checkRateLimit(
      clientIp,
      `/api/volunteer-signups:${church.id}`,
      VOLUNTEER_SIGNUP_RATE_LIMIT
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body = await request.json();

    // Check honeypot field - if filled, it's likely a bot
    if (body.website && body.website.length > 0) {
      logger.warn("Honeypot triggered on volunteer signup form", {
        churchId: church.id,
        ip: clientIp,
      });
      // Return success to not tip off the bot, but don't process
      return NextResponse.json(
        { success: true, message: "Thank you for your interest in volunteering!" },
        { headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate input
    const result = volunteerSignupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { name, email, phone, interests, message } = result.data;
    const userAgent = headerStore.get("user-agent") || undefined;

    // Store submission in database
    const db = getTenantPrisma(church.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.volunteerSignup.create as any)({
      data: {
        name,
        email,
        phone: phone || null,
        interests: interests || [],
        message: message || null,
        ipAddress: clientIp,
        userAgent,
      },
    });

    // Send notification emails if configured
    // First check volunteerNotifyEmails, then fall back to contactEmail
    const notificationEmails = parseNotificationEmails(
      church.siteSettings?.volunteerNotifyEmails || null
    );

    // Fall back to contactEmail if no specific volunteer notification emails
    if (notificationEmails.length === 0 && church.siteSettings?.contactEmail) {
      notificationEmails.push(church.siteSettings.contactEmail);
    }

    if (notificationEmails.length > 0) {
      try {
        await sendVolunteerSignupNotificationEmail(
          notificationEmails,
          church.name,
          name,
          email,
          phone || null,
          interests || [],
          message || null
        );
      } catch (emailError) {
        // Log but don't fail the request if email fails
        logger.error("Failed to send volunteer signup notification email", emailError as Error);
      }
    }

    logger.info("Volunteer signup submitted", {
      churchId: church.id,
      email,
    });

    return NextResponse.json(
      { success: true, message: "Thank you for your interest in volunteering! We'll be in touch soon." },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    logger.error("Volunteer signup submission failed", error as Error);
    return NextResponse.json(
      { error: "Failed to submit volunteer signup. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/volunteer-signups
 * List volunteer signups for the current church. Admin/Editor only.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const isArchived = searchParams.get("archived") === "true";
    const isRead = searchParams.get("read");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isArchived,
    };

    if (isRead !== null) {
      where.isRead = isRead === "true";
    }

    // Get total count and volunteer signups
    const [total, volunteerSignups] = await Promise.all([
      db.volunteerSignup.count({ where }),
      db.volunteerSignup.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        volunteerSignups,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to list volunteer signups", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to load volunteer signups" },
      { status: 500 }
    );
  }
}
