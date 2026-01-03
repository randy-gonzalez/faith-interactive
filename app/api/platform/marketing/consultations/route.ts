/**
 * Consultation Requests API Routes
 *
 * GET /api/platform/marketing/consultations - List all consultation requests
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformUser } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";

/**
 * GET /api/platform/marketing/consultations
 * List all consultation requests with optional filters.
 */
export async function GET(request: NextRequest) {
  try {
    await requirePlatformUser();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assignedToId = searchParams.get("assignedToId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;

    const consultations = await prisma.consultationRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Get counts by status
    const statusCounts = await prisma.consultationRequest.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const counts = statusCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({ consultations, counts });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to list consultation requests", error as Error);
    return NextResponse.json(
      { error: "Failed to list consultation requests" },
      { status: 500 }
    );
  }
}
