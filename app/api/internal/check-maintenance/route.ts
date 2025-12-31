/**
 * Internal Maintenance Mode Check API
 *
 * GET /api/internal/check-maintenance?churchSlug=xxx
 *
 * This endpoint is called by the Edge middleware to check if a church
 * has maintenance mode enabled. Only accepts internal requests.
 *
 * Returns:
 * - { maintenanceMode: true/false }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  // Only allow internal requests from middleware
  const isInternal = request.headers.get("x-internal-request") === "1";
  if (!isInternal) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const churchSlug = request.nextUrl.searchParams.get("churchSlug");

  if (!churchSlug) {
    return NextResponse.json({ maintenanceMode: false });
  }

  try {
    // Get church and its site settings
    const church = await prisma.church.findUnique({
      where: { slug: churchSlug },
      include: {
        siteSettings: {
          select: { maintenanceMode: true },
        },
      },
    });

    if (!church) {
      return NextResponse.json({ maintenanceMode: false });
    }

    return NextResponse.json({
      maintenanceMode: church.siteSettings?.maintenanceMode ?? false,
    });
  } catch (error) {
    console.error("Maintenance check error:", error);
    return NextResponse.json({ maintenanceMode: false });
  }
}
