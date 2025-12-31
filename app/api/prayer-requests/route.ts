/**
 * Prayer Requests API Routes
 *
 * POST /api/prayer-requests - Submit a prayer request (public, rate-limited)
 * GET /api/prayer-requests - List prayer requests (admin/editor only)
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
import { prayerRequestSchema, formatZodError } from "@/lib/validation/schemas";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/security/rate-limit";
import { sendPrayerRequestNotificationEmail } from "@/lib/email/send";
import { requireContentEditor, AuthError } from "@/lib/auth/guards";
import type { ApiResponse } from "@/types";

// Rate limit: 3 prayer requests per hour per IP
const PRAYER_REQUEST_RATE_LIMIT = {
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
 * POST /api/prayer-requests
 * Submit a prayer request. Public endpoint with rate limiting.
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
      `/api/prayer-requests:${church.id}`,
      PRAYER_REQUEST_RATE_LIMIT
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
      logger.warn("Honeypot triggered on prayer request form", {
        churchId: church.id,
        ip: clientIp,
      });
      // Return success to not tip off the bot, but don't process
      return NextResponse.json(
        { success: true, message: "Thank you for your prayer request." },
        { headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate input
    const result = prayerRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { name, email, request: prayerRequest } = result.data;
    const userAgent = headerStore.get("user-agent") || undefined;

    // Store submission in database
    const db = getTenantPrisma(church.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.prayerRequest.create as any)({
      data: {
        name: name || null,
        email: email || null,
        request: prayerRequest,
        ipAddress: clientIp,
        userAgent,
      },
    });

    // Send notification emails if configured
    // First check prayerNotifyEmails, then fall back to contactEmail
    const notificationEmails = parseNotificationEmails(
      church.siteSettings?.prayerNotifyEmails || null
    );

    // Fall back to contactEmail if no specific prayer notification emails
    if (notificationEmails.length === 0 && church.siteSettings?.contactEmail) {
      notificationEmails.push(church.siteSettings.contactEmail);
    }

    if (notificationEmails.length > 0) {
      try {
        await sendPrayerRequestNotificationEmail(
          notificationEmails,
          church.name,
          name || null,
          email || null,
          prayerRequest
        );
      } catch (emailError) {
        // Log but don't fail the request if email fails
        logger.error("Failed to send prayer request notification email", emailError as Error);
      }
    }

    logger.info("Prayer request submitted", {
      churchId: church.id,
      isAnonymous: !name && !email,
    });

    return NextResponse.json(
      { success: true, message: "Thank you for your prayer request. We will keep you in our prayers." },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    logger.error("Prayer request submission failed", error as Error);
    return NextResponse.json(
      { error: "Failed to submit prayer request. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/prayer-requests
 * List prayer requests for the current church. Admin/Editor only.
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

    // Get total count and prayer requests
    const [total, prayerRequests] = await Promise.all([
      db.prayerRequest.count({ where }),
      db.prayerRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        prayerRequests,
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
    logger.error("Failed to list prayer requests", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to load prayer requests" },
      { status: 500 }
    );
  }
}
