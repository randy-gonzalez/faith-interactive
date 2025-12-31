/**
 * Redirect Rules API Routes
 *
 * GET /api/redirects - List all redirect rules (Admin only)
 * POST /api/redirects - Create a new redirect rule (Admin only)
 *
 * Phase 5: Includes open redirect prevention and audit logging.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";
import { formatZodError } from "@/lib/validation/schemas";
import { validateRedirectUrl } from "@/lib/security/redirect-validator";
import { auditLog } from "@/lib/audit/audit-log";

// Validation schema for creating a redirect
const createRedirectSchema = z.object({
  sourcePath: z
    .string()
    .min(1, "Source path is required")
    .max(500, "Source path too long")
    .transform((p) => {
      // Ensure path starts with /
      const path = p.trim();
      return path.startsWith("/") ? path : `/${path}`;
    })
    .refine(
      (p) => !p.includes("?") && !p.includes("#"),
      "Source path should not include query strings or fragments"
    ),
  destinationUrl: z
    .string()
    .min(1, "Destination is required")
    .max(2000, "Destination URL too long")
    .refine(
      (url) => {
        // Allow relative paths starting with / or absolute URLs
        if (url.startsWith("/")) return true;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      "Destination must be a valid URL or path starting with /"
    ),
  isActive: z.boolean().optional().default(true),
});

/**
 * GET /api/redirects
 * List all redirect rules for the church.
 * Admin only.
 */
export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require admin role
    if (context.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const db = getTenantPrisma(context.church.id);
    const redirects = await db.redirectRule.findMany({
      orderBy: { sourcePath: "asc" },
    });

    return NextResponse.json({ redirects });
  } catch (error) {
    logger.error("Failed to list redirects", error as Error);
    return NextResponse.json(
      { error: "Failed to list redirects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/redirects
 * Create a new redirect rule.
 * Admin only.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const result = createRedirectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const { sourcePath, destinationUrl, isActive } = result.data;

    // Phase 5: Validate destination URL for open redirect prevention
    const urlValidation = validateRedirectUrl(destinationUrl);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { error: urlValidation.reason || "Invalid destination URL" },
        { status: 400 }
      );
    }

    // Use the validated/normalized URL
    const safeDestinationUrl = urlValidation.url || destinationUrl;

    // Check for self-redirect (loop)
    if (sourcePath === safeDestinationUrl) {
      return NextResponse.json(
        { error: "Source and destination cannot be the same" },
        { status: 400 }
      );
    }

    const db = getTenantPrisma(user.churchId);

    // Check if source path already exists
    const existing = await db.redirectRule.findFirst({
      where: { sourcePath },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A redirect for this source path already exists" },
        { status: 409 }
      );
    }

    // Create the redirect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const redirect = await (db.redirectRule.create as any)({
      data: {
        sourcePath,
        destinationUrl: safeDestinationUrl,
        isActive,
      },
    });

    // Phase 5: Audit log
    await auditLog.logRedirectAction(
      user.churchId,
      user.id,
      user.email,
      "REDIRECT_CREATED",
      redirect.id,
      { sourcePath, destinationUrl: safeDestinationUrl }
    );

    logger.info("Redirect rule created", {
      churchId: user.churchId,
      redirectId: redirect.id,
      sourcePath,
      destinationUrl: safeDestinationUrl,
    });

    return NextResponse.json({ redirect }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    logger.error("Failed to create redirect", error as Error);
    return NextResponse.json(
      { error: "Failed to create redirect" },
      { status: 500 }
    );
  }
}
