/**
 * Contact Form API Route
 *
 * POST /api/contact - Submit contact form (public, rate-limited)
 *
 * Security measures:
 * - Honeypot field detection
 * - Rate limiting per IP
 * - Input validation
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";
import { contactFormSchema, formatZodError } from "@/lib/validation/schemas";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/security/rate-limit";
import { sendContactNotificationEmail } from "@/lib/email/send";

// Stricter rate limit for contact form (5 submissions per hour per IP)
const CONTACT_RATE_LIMIT = {
  max: 5,
  windowSeconds: 3600, // 1 hour
};

/**
 * POST /api/contact
 * Submit a contact form. Public endpoint with rate limiting.
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
      `/api/contact:${church.id}`,
      CONTACT_RATE_LIMIT
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
      logger.warn("Honeypot triggered on contact form", {
        churchId: church.id,
        ip: clientIp,
      });
      // Return success to not tip off the bot, but don't process
      return NextResponse.json(
        { success: true, message: "Thank you for your message!" },
        { headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate input
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { name, email, message } = result.data;
    const userAgent = headerStore.get("user-agent") || undefined;

    // Store submission in database
    const db = getTenantPrisma(church.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.contactSubmission.create as any)({
      data: {
        name,
        email,
        message,
        ipAddress: clientIp,
        userAgent,
      },
    });

    // Send notification email if configured
    const notificationEmail = church.siteSettings?.contactEmail;
    if (notificationEmail) {
      try {
        await sendContactNotificationEmail(
          notificationEmail,
          church.name,
          name,
          email,
          message
        );
      } catch (emailError) {
        // Log but don't fail the request if email fails
        logger.error("Failed to send contact notification email", emailError as Error);
      }
    }

    logger.info("Contact form submitted", {
      churchId: church.id,
      senderEmail: email,
    });

    return NextResponse.json(
      { success: true, message: "Thank you for your message! We'll be in touch soon." },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    logger.error("Contact form submission failed", error as Error);
    return NextResponse.json(
      { error: "Failed to submit contact form. Please try again." },
      { status: 500 }
    );
  }
}
