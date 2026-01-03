/**
 * Case Studies API Routes
 *
 * GET /api/platform/marketing/case-studies - List all case studies
 * POST /api/platform/marketing/case-studies - Create a new case study
 */

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";
import { caseStudySchema, formatZodError } from "@/lib/validation/schemas";

/**
 * GET /api/platform/marketing/case-studies
 * List all case studies.
 */
export async function GET(request: NextRequest) {
  try {
    await requirePlatformUser();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (featured === "true") where.featured = true;

    const caseStudies = await prisma.caseStudy.findMany({
      where,
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { churchName: "asc" }],
    });

    return NextResponse.json({ caseStudies });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to list case studies", error as Error);
    return NextResponse.json(
      { error: "Failed to list case studies" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/marketing/case-studies
 * Create a new case study.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const result = caseStudySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const {
      churchName,
      slug,
      logo,
      description,
      images,
      beforeImage,
      afterImage,
      testimonialQuote,
      testimonialName,
      testimonialTitle,
      metrics,
      liveSiteUrl,
      featured,
      sortOrder,
      status,
    } = result.data;

    // Check if slug is already taken
    const existing = await prisma.caseStudy.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A case study with this slug already exists" },
        { status: 409 }
      );
    }

    const caseStudy = await prisma.caseStudy.create({
      data: {
        churchName,
        slug,
        logo: logo || null,
        description,
        images: images || [],
        beforeImage: beforeImage || null,
        afterImage: afterImage || null,
        testimonialQuote: testimonialQuote || null,
        testimonialName: testimonialName || null,
        testimonialTitle: testimonialTitle || null,
        metrics: metrics ?? Prisma.JsonNull,
        liveSiteUrl: liveSiteUrl || null,
        featured: featured || false,
        sortOrder: sortOrder || 0,
        status: status || "DRAFT",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    logger.info("Case study created", {
      caseStudyId: caseStudy.id,
      slug,
      createdBy: user.email,
    });

    return NextResponse.json({ caseStudy }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to create case study", error as Error);
    return NextResponse.json(
      { error: "Failed to create case study" },
      { status: 500 }
    );
  }
}
