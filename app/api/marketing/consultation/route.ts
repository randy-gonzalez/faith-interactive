/**
 * Public Consultation Form API
 *
 * POST /api/marketing/consultation - Submit a consultation request
 *
 * Public endpoint with spam protection and rate limiting.
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { logger } from "@/lib/logging/logger";
import { consultationFormSchema, formatZodError } from "@/lib/validation/schemas";
import { createId } from "@paralleldrive/cuid2";

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
    const sql = neon(process.env.DATABASE_URL!);
    const id = createId();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO "ConsultationRequest" (
        id, name, email, phone, "churchName", "packageInterest",
        message, "ipAddress", "userAgent", status, "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${name}, ${email}, ${phone || null}, ${churchName || null},
        ${packageInterest || null}, ${message || null}, ${ip},
        ${userAgent || null}, 'NEW', ${now}, ${now}
      )
    `;

    logger.info("Consultation request submitted", {
      consultationId: id,
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
