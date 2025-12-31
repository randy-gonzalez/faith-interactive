/**
 * Leadership Profiles API Routes
 *
 * GET /api/leadership - List all leadership profiles for the church
 * POST /api/leadership - Create a new leadership profile
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { leadershipProfileSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

export async function GET() {
  try {
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const profiles = await db.leadershipProfile.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch leadership profiles", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch leadership profiles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const body = await request.json();
    const result = leadershipProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Get the highest sort order to add new profile at the end
    const lastProfile = await db.leadershipProfile.findFirst({
      orderBy: { sortOrder: "desc" },
    });
    const sortOrder = (lastProfile?.sortOrder || 0) + 1;

    // churchId is automatically injected by tenant-prisma extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await (db.leadershipProfile.create as any)({
      data: {
        name: result.data.name,
        title: result.data.title,
        bio: result.data.bio || null,
        photoUrl: result.data.photoUrl || null,
        email: result.data.email || null,
        sortOrder,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to create leadership profile", error as Error);
    return NextResponse.json(
      { error: "Failed to create leadership profile" },
      { status: 500 }
    );
  }
}
