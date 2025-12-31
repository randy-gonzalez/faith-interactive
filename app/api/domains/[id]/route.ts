/**
 * Domain-specific API Routes
 *
 * GET /api/domains/[id] - Get domain details (Admin only)
 * DELETE /api/domains/[id] - Remove a custom domain (Admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/domains/[id]
 * Get details of a specific domain.
 * Admin only.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    return NextResponse.json({ domain });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    logger.error("Failed to get domain", error as Error);
    return NextResponse.json(
      { error: "Failed to get domain" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/domains/[id]
 * Remove a custom domain.
 * Admin only.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    // Verify domain belongs to this church
    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Delete the domain
    await prisma.customDomain.delete({
      where: { id },
    });

    logger.info("Custom domain removed", {
      churchId: user.churchId,
      hostname: domain.hostname,
      domainId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    logger.error("Failed to remove domain", error as Error);
    return NextResponse.json(
      { error: "Failed to remove domain" },
      { status: 500 }
    );
  }
}
