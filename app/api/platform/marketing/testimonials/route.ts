/**
 * Testimonials API Routes
 *
 * GET /api/platform/marketing/testimonials - List all testimonials
 * POST /api/platform/marketing/testimonials - Create a new testimonial
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";
import { testimonialSchema, formatZodError } from "@/lib/validation/schemas";

/**
 * GET /api/platform/marketing/testimonials
 * List all testimonials.
 */
export async function GET(request: NextRequest) {
  try {
    await requirePlatformUser();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") !== "false";
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {};
    if (activeOnly) where.isActive = true;
    if (featured === "true") where.featured = true;

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to list testimonials", error as Error);
    return NextResponse.json(
      { error: "Failed to list testimonials" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/marketing/testimonials
 * Create a new testimonial.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const result = testimonialSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const {
      name,
      title,
      company,
      quote,
      image,
      featured,
      sortOrder,
      isActive,
    } = result.data;

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        title: title || null,
        company: company || null,
        quote,
        image: image || null,
        featured: featured || false,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      },
    });

    logger.info("Testimonial created", {
      testimonialId: testimonial.id,
      name,
      createdBy: user.email,
    });

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to create testimonial", error as Error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
