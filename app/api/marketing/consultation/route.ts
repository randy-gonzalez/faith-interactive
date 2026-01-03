/**
 * Public Consultation Form API
 *
 * POST /api/marketing/consultation - Submit a consultation request
 *
 * Public endpoint with spam protection and rate limiting.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import { consultationFormSchema, formatZodError } from "@/lib/validation/schemas";
import { sendConsultationNotificationEmail } from "@/lib/email/send";

// Simple in-memory rate limiting (use Redis in production for multi-instance)
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
 * POST /api/marketing/consultation
 * Submit a consultation request from the public website.
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0].trim() || "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    // Rate limiting
    if (!checkRateLimit(ip)) {
      logger.warn("Consultation form rate limited", { ip });
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = consultationFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      churchName,
      packageInterest,
      message,
      website, // Honeypot field
    } = result.data;

    // Honeypot check - if filled, it's likely a bot
    if (website && website.length > 0) {
      // Log but return success to not tip off the bot
      logger.info("Consultation form honeypot triggered", { ip });
      return NextResponse.json({
        success: true,
        message: "Thank you! We'll be in touch soon.",
      });
    }

    // Save to database
    const consultation = await prisma.consultationRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        churchName: churchName || null,
        packageInterest: packageInterest || null,
        message: message || null,
        ipAddress: ip,
        userAgent: userAgent || null,
      },
    });

    // Get platform admin emails for notification
    const platformAdmins = await prisma.user.findMany({
      where: {
        platformRole: "PLATFORM_ADMIN",
        isActive: true,
      },
      select: {
        email: true,
      },
    });

    const adminEmails = platformAdmins.map((u) => u.email);

    // Send email notification
    if (adminEmails.length > 0) {
      try {
        await sendConsultationNotificationEmail(
          adminEmails,
          {
            name,
            email,
            phone: phone || null,
            churchName: churchName || null,
            packageInterest: packageInterest || null,
            message: message || null,
          },
          consultation.id
        );
      } catch (emailError) {
        // Log but don't fail the request
        logger.error("Failed to send consultation notification email", emailError as Error);
      }
    }

    logger.info("Consultation request submitted", {
      consultationId: consultation.id,
      email,
      packageInterest,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll be in touch within 24 hours.",
    });
  } catch (error) {
    logger.error("Failed to submit consultation request", error as Error);
    return NextResponse.json(
      { error: "Failed to submit consultation request. Please try again." },
      { status: 500 }
    );
  }
}
