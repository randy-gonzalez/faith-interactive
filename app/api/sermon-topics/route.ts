/**
 * Sermon Topics API Routes
 *
 * GET /api/sermon-topics - List all topics for the church
 * POST /api/sermon-topics - Create a new topic
 */

import { NextResponse } from "next/server";
import { requireAuth, requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { sermonTopicSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

export async function GET() {
  try {
    const { churchId } = await requireAuth();
    const db = getTenantPrisma(churchId);

    const topics = await db.sermonTopic.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { sermons: true },
        },
      },
    });

    return NextResponse.json({ topics });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to fetch sermon topics", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch sermon topics" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { churchId } = await requireContentEditor();
    const db = getTenantPrisma(churchId);

    const body = await request.json();
    const result = sermonTopicSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await db.sermonTopic.findFirst({
      where: { slug: result.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A topic with this slug already exists", details: { fieldErrors: { slug: ["Slug already in use"] } } },
        { status: 400 }
      );
    }

    // churchId is automatically injected by tenant-prisma extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topic = await (db.sermonTopic.create as any)({
      data: {
        name: result.data.name,
        slug: result.data.slug,
        description: result.data.description || null,
      },
    });

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to create sermon topic", error as Error);
    return NextResponse.json(
      { error: "Failed to create sermon topic" },
      { status: 500 }
    );
  }
}
