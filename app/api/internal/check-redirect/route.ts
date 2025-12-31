/**
 * Internal Redirect Check API
 *
 * GET /api/internal/check-redirect?churchId=xxx&path=/old-page
 *
 * This endpoint is called by the Edge middleware to check for redirect rules.
 * Only accepts internal requests.
 *
 * Returns:
 * - { redirect: { destinationUrl: "..." } } if redirect found
 * - { redirect: null } if no redirect
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

// Maximum redirect chain depth to prevent loops
const MAX_REDIRECT_DEPTH = 5;

export async function GET(request: NextRequest) {
  // Only allow internal requests from middleware
  const isInternal = request.headers.get("x-internal-request") === "1";
  if (!isInternal) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const churchSlug = request.nextUrl.searchParams.get("churchSlug");
  const path = request.nextUrl.searchParams.get("path");

  if (!churchSlug || !path) {
    return NextResponse.json({ redirect: null });
  }

  try {
    // First, get the church ID from the slug
    const church = await prisma.church.findUnique({
      where: { slug: churchSlug },
      select: { id: true },
    });

    if (!church) {
      return NextResponse.json({ redirect: null });
    }

    // Normalize path (remove trailing slash except for root)
    const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");

    // Look up active redirect rule
    const redirectRule = await prisma.redirectRule.findFirst({
      where: {
        churchId: church.id,
        sourcePath: normalizedPath,
        isActive: true,
      },
    });

    if (!redirectRule) {
      return NextResponse.json({ redirect: null });
    }

    // Check for redirect chains/loops
    const destinationUrl = redirectRule.destinationUrl;

    // If destination is a relative path, check for potential chains
    if (destinationUrl.startsWith("/")) {
      const seenPaths = new Set([normalizedPath]);
      let currentPath = destinationUrl;
      let depth = 0;

      while (currentPath.startsWith("/") && depth < MAX_REDIRECT_DEPTH) {
        if (seenPaths.has(currentPath)) {
          // Loop detected
          logger.warn("Redirect loop detected", {
            churchId: church.id,
            sourcePath: normalizedPath,
            loopPath: currentPath,
          });
          return NextResponse.json({ redirect: null, error: "Redirect loop detected" });
        }

        // Check if there's another redirect for this path
        const nextRedirect = await prisma.redirectRule.findFirst({
          where: {
            churchId: church.id,
            sourcePath: currentPath,
            isActive: true,
          },
        });

        if (!nextRedirect) break;

        seenPaths.add(currentPath);
        currentPath = nextRedirect.destinationUrl;
        depth++;
      }

      if (depth >= MAX_REDIRECT_DEPTH) {
        logger.warn("Redirect chain too deep", {
          churchId: church.id,
          sourcePath: normalizedPath,
          depth,
        });
        return NextResponse.json({ redirect: null, error: "Redirect chain too deep" });
      }
    }

    logger.info("Redirect applied", {
      churchId: church.id,
      sourcePath: normalizedPath,
      destinationUrl,
    });

    return NextResponse.json({
      redirect: {
        destinationUrl,
        statusCode: 301, // Always permanent redirect per spec
      },
    });
  } catch (error) {
    logger.error("Redirect check error", error as Error, { churchSlug, path });
    return NextResponse.json({ redirect: null });
  }
}
