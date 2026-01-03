/**
 * Case Study Detail API Routes
 *
 * GET /api/platform/marketing/case-studies/[id] - Get a single case study
 * PATCH /api/platform/marketing/case-studies/[id] - Update a case study
 * DELETE /api/platform/marketing/case-studies/[id] - Delete a case study
 */

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin, requirePlatformUser } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";
import { caseStudySchema, formatZodError } from "@/lib/validation/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/platform/marketing/case-studies/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePlatformUser();
    const { id } = await params;

    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id },
    });

    if (!caseStudy) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    return NextResponse.json({ caseStudy });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to get case study", error as Error);
    return NextResponse.json(
      { error: "Failed to get case study" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/marketing/case-studies/[id]
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePlatformAdmin();
    const { id } = await params;

    const existing = await prisma.caseStudy.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = caseStudySchema.partial().safeParse(body);

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

    // Check if new slug conflicts
    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.caseStudy.findUnique({
        where: { slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: "A case study with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Determine publishedAt
    let publishedAt = existing.publishedAt;
    if (status === "PUBLISHED" && !existing.publishedAt) {
      publishedAt = new Date();
    }

    const caseStudy = await prisma.caseStudy.update({
      where: { id },
      data: {
        ...(churchName !== undefined && { churchName }),
        ...(slug !== undefined && { slug }),
        ...(logo !== undefined && { logo: logo || null }),
        ...(description !== undefined && { description }),
        ...(images !== undefined && { images }),
        ...(beforeImage !== undefined && { beforeImage: beforeImage || null }),
        ...(afterImage !== undefined && { afterImage: afterImage || null }),
        ...(testimonialQuote !== undefined && { testimonialQuote: testimonialQuote || null }),
        ...(testimonialName !== undefined && { testimonialName: testimonialName || null }),
        ...(testimonialTitle !== undefined && { testimonialTitle: testimonialTitle || null }),
        ...(metrics !== undefined && { metrics: metrics === null ? Prisma.JsonNull : metrics }),
        ...(liveSiteUrl !== undefined && { liveSiteUrl: liveSiteUrl || null }),
        ...(featured !== undefined && { featured }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(status !== undefined && { status, publishedAt }),
      },
    });

    logger.info("Case study updated", {
      caseStudyId: id,
      updatedBy: user.email,
    });

    return NextResponse.json({ caseStudy });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to update case study", error as Error);
    return NextResponse.json(
      { error: "Failed to update case study" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/marketing/case-studies/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePlatformAdmin();
    const { id } = await params;

    const existing = await prisma.caseStudy.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    await prisma.caseStudy.delete({
      where: { id },
    });

    logger.info("Case study deleted", {
      caseStudyId: id,
      slug: existing.slug,
      deletedBy: user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to delete case study", error as Error);
    return NextResponse.json(
      { error: "Failed to delete case study" },
      { status: 500 }
    );
  }
}
