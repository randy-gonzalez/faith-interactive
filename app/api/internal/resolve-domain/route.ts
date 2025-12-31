/**
 * Internal Domain Resolution API
 *
 * GET /api/internal/resolve-domain?hostname=example.com
 *
 * This endpoint is called by the Edge middleware to resolve custom domains
 * to church slugs. It only accepts internal requests (marked by x-internal-request header).
 *
 * Returns:
 * - { churchSlug: "slug" } if domain is found and active
 * - { churchSlug: null } if domain is not found or not active
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export async function GET(request: NextRequest) {
  // Only allow internal requests from middleware
  const isInternal = request.headers.get("x-internal-request") === "1";
  if (!isInternal) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const hostname = request.nextUrl.searchParams.get("hostname");

  if (!hostname) {
    return NextResponse.json({ churchSlug: null });
  }

  try {
    // Normalize hostname (lowercase, no trailing dot)
    const normalizedHostname = hostname.toLowerCase().replace(/\.$/, "");

    // Look up the domain in the database
    const domain = await prisma.customDomain.findFirst({
      where: {
        hostname: normalizedHostname,
        status: "ACTIVE", // Only resolve active domains
      },
      include: {
        church: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (domain) {
      logger.info("Custom domain resolved", {
        hostname: normalizedHostname,
        churchSlug: domain.church.slug,
      });

      return NextResponse.json({
        churchSlug: domain.church.slug,
      });
    }

    // Domain not found or not active
    logger.info("Custom domain not found", { hostname: normalizedHostname });

    return NextResponse.json({ churchSlug: null });
  } catch (error) {
    logger.error("Domain resolution error", error as Error, { hostname });
    return NextResponse.json({ churchSlug: null });
  }
}
