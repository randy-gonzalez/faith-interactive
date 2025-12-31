/**
 * Single Leadership Profile API Routes
 *
 * GET /api/leadership/[id] - Get profile by ID
 * PUT /api/leadership/[id] - Update profile
 * DELETE /api/leadership/[id] - Delete profile
 * PATCH /api/leadership/[id] - Publish/unpublish or reorder
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { leadershipProfileSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const profile = await db.leadershipProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch leadership profile", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch leadership profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.leadershipProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = leadershipProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const profile = await db.leadershipProfile.update({
      where: { id },
      data: {
        name: result.data.name,
        title: result.data.title,
        bio: result.data.bio || null,
        photoUrl: result.data.photoUrl || null,
        email: result.data.email || null,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update leadership profile", error as Error);
    return NextResponse.json(
      { error: "Failed to update leadership profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.leadershipProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await db.leadershipProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to delete leadership profile", error as Error);
    return NextResponse.json(
      { error: "Failed to delete leadership profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const existing = await db.leadershipProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action, sortOrder } = body;

    if (action === "publish") {
      const profile = await db.leadershipProfile.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      return NextResponse.json({ profile });
    }

    if (action === "unpublish") {
      const profile = await db.leadershipProfile.update({
        where: { id },
        data: {
          status: "DRAFT",
          publishedAt: null,
        },
      });
      return NextResponse.json({ profile });
    }

    if (action === "reorder" && typeof sortOrder === "number") {
      const profile = await db.leadershipProfile.update({
        where: { id },
        data: { sortOrder },
      });
      return NextResponse.json({ profile });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update leadership profile", error as Error);
    return NextResponse.json(
      { error: "Failed to update leadership profile" },
      { status: 500 }
    );
  }
}
