/**
 * Website Review Request API
 *
 * POST /api/marketing/website-review - Submit a website review request
 *
 * Public endpoint for the "First-Time Visitor Website Review" lead magnet.
 * Includes spam protection via honeypot and rate limiting.
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { logger } from "@/lib/logging/logger";
import { websiteReviewRequestSchema, formatZodError } from "@/lib/validation/schemas";
import { createId } from "@paralleldrive/cuid2";
import { sendWebsiteReviewNotificationEmail } from "@/lib/email/send";

// Admin email(s) to receive website review request notifications
const ADMIN_NOTIFICATION_EMAILS = (process.env.ADMIN_NOTIFICATION_EMAILS || "randy@faith-interactive.com").split(",").map(e => e.trim());

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // Max submissions per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * POST /api/marketing/website-review
 * Submit a website review request from the public website.
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0].trim() || "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    // Rate limiting
    if (!checkRateLimit(ip)) {
      logger.warn("Website review form rate limited", { ip });
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = websiteReviewRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      churchName,
      websiteUrl,
      role,
      website, // Honeypot field
    } = result.data;

    // Honeypot check - if filled, it's likely a bot
    if (website && website.length > 0) {
      // Log but return success to not tip off the bot
      logger.info("Website review form honeypot triggered", { ip });
      return NextResponse.json({
        success: true,
        message: "Thank you! We'll send your review within 24-48 hours.",
      });
    }

    // Save to database
    const sql = neon(process.env.DATABASE_URL!);
    const id = createId();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO "WebsiteReviewRequest" (
        id, name, email, "churchName", "websiteUrl", role,
        "ipAddress", "userAgent", status, "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${name}, ${email}, ${churchName}, ${websiteUrl},
        ${role || null}, ${ip}, ${userAgent || null}, 'NEW', ${now}, ${now}
      )
    `;

    logger.info("Website review request submitted", {
      reviewId: id,
      email,
      churchName,
      websiteUrl,
    });

    // Send email notification to admin(s)
    try {
      await sendWebsiteReviewNotificationEmail(
        ADMIN_NOTIFICATION_EMAILS,
        {
          name,
          email,
          churchName,
          websiteUrl,
          role: role || null,
        },
        id
      );
      logger.info("Website review notification email sent", { reviewId: id });
    } catch (emailError) {
      // Log but don't fail the request if email fails
      logger.error("Failed to send website review notification email", emailError as Error, { reviewId: id });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll send your review within 24-48 hours.",
    });
  } catch (error) {
    logger.error("Failed to submit website review request", error as Error);
    return NextResponse.json(
      { error: "Failed to submit your request. Please try again." },
      { status: 500 }
    );
  }
}
