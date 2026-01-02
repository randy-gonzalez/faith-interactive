/**
 * Speakers API Routes
 *
 * GET /api/speakers - List all speakers for the church
 * POST /api/speakers - Create a new speaker
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { speakerSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

export async function GET() {
  try {
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const speakers = await db.speaker.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ speakers });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch speakers", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch speakers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const body = await request.json();
    const result = speakerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Get the highest sort order to add new speaker at the end
    const lastSpeaker = await db.speaker.findFirst({
      orderBy: { sortOrder: "desc" },
    });
    const sortOrder = result.data.sortOrder ?? (lastSpeaker?.sortOrder || 0) + 1;

    // churchId is automatically injected by tenant-prisma extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const speaker = await (db.speaker.create as any)({
      data: {
        name: result.data.name,
        title: result.data.title || null,
        bio: result.data.bio || null,
        photoUrl: result.data.photoUrl || null,
        email: result.data.email || null,
        sortOrder,
        isGuest: result.data.isGuest ?? false,
        status: "PUBLISHED", // Speakers default to published
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ speaker }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to create speaker", error as Error);
    return NextResponse.json(
      { error: "Failed to create speaker" },
      { status: 500 }
    );
  }
}
