/**
 * Redirect Rule API Routes
 *
 * GET /api/redirects/[id] - Get redirect details (Admin only)
 * PATCH /api/redirects/[id] - Update a redirect rule (Admin only)
 * DELETE /api/redirects/[id] - Delete a redirect rule (Admin only)
 *
 * Phase 5: Includes open redirect prevention and audit logging.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";
import { formatZodError } from "@/lib/validation/schemas";
import { validateRedirectUrl } from "@/lib/security/redirect-validator";
import { auditLog } from "@/lib/audit/audit-log";

type RouteParams = { params: Promise<{ id: string }> };

// Validation schema for updating a redirect
const updateRedirectSchema = z.object({
  sourcePath: z
    .string()
    .min(1)
    .max(500)
    .transform((p) => {
      const path = p.trim();
      return path.startsWith("/") ? path : `/${path}`;
    })
    .refine(
      (p) => !p.includes("?") && !p.includes("#"),
      "Source path should not include query strings or fragments"
    )
    .optional(),
  destinationUrl: z
    .string()
    .min(1)
    .max(2000)
    .refine(
      (url) => {
        if (url.startsWith("/")) return true;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      "Destination must be a valid URL or path starting with /"
    )
    .optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/redirects/[id]
 * Get details of a specific redirect rule.
 * Admin only.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    const db = getTenantPrisma(user.churchId);
    const redirect = await db.redirectRule.findFirst({
      where: { id },
    });

    if (!redirect) {
      return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
    }

    return NextResponse.json({ redirect });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    logger.error("Failed to get redirect", error as Error);
    return NextResponse.json(
      { error: "Failed to get redirect" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/redirects/[id]
 * Update a redirect rule.
 * Admin only.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const result = updateRedirectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const db = getTenantPrisma(user.churchId);

    // Check redirect exists
    const existing = await db.redirectRule.findFirst({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
    }

    const { sourcePath, destinationUrl, isActive } = result.data;

    // Phase 5: Validate destination URL if being updated
    let safeDestinationUrl = destinationUrl;
    if (destinationUrl !== undefined) {
      const urlValidation = validateRedirectUrl(destinationUrl);
      if (!urlValidation.valid) {
        return NextResponse.json(
          { error: urlValidation.reason || "Invalid destination URL" },
          { status: 400 }
        );
      }
      safeDestinationUrl = urlValidation.url || destinationUrl;
    }

    // Check for self-redirect
    const newSource = sourcePath ?? existing.sourcePath;
    const newDest = safeDestinationUrl ?? existing.destinationUrl;
    if (newSource === newDest) {
      return NextResponse.json(
        { error: "Source and destination cannot be the same" },
        { status: 400 }
      );
    }

    // If changing source path, check for conflicts
    if (sourcePath && sourcePath !== existing.sourcePath) {
      const conflict = await db.redirectRule.findFirst({
        where: { sourcePath },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "A redirect for this source path already exists" },
          { status: 409 }
        );
      }
    }

    // Update the redirect
    const redirect = await db.redirectRule.update({
      where: { id },
      data: {
        ...(sourcePath !== undefined && { sourcePath }),
        ...(safeDestinationUrl !== undefined && { destinationUrl: safeDestinationUrl }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Phase 5: Audit log
    await auditLog.logRedirectAction(
      user.churchId,
      user.id,
      user.email,
      "REDIRECT_UPDATED",
      redirect.id,
      {
        changes: {
          ...(sourcePath !== undefined && { sourcePath: { from: existing.sourcePath, to: sourcePath } }),
          ...(safeDestinationUrl !== undefined && { destinationUrl: { from: existing.destinationUrl, to: safeDestinationUrl } }),
          ...(isActive !== undefined && { isActive: { from: existing.isActive, to: isActive } }),
        },
      }
    );

    logger.info("Redirect rule updated", {
      churchId: user.churchId,
      redirectId: id,
    });

    return NextResponse.json({ redirect });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    logger.error("Failed to update redirect", error as Error);
    return NextResponse.json(
      { error: "Failed to update redirect" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/redirects/[id]
 * Delete a redirect rule.
 * Admin only.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    const db = getTenantPrisma(user.churchId);

    // Check redirect exists
    const existing = await db.redirectRule.findFirst({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
    }

    // Delete the redirect
    await db.redirectRule.delete({
      where: { id },
    });

    // Phase 5: Audit log
    await auditLog.logRedirectAction(
      user.churchId,
      user.id,
      user.email,
      "REDIRECT_DELETED",
      id,
      {
        sourcePath: existing.sourcePath,
        destinationUrl: existing.destinationUrl,
      }
    );

    logger.info("Redirect rule deleted", {
      churchId: user.churchId,
      redirectId: id,
      sourcePath: existing.sourcePath,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    logger.error("Failed to delete redirect", error as Error);
    return NextResponse.json(
      { error: "Failed to delete redirect" },
      { status: 500 }
    );
  }
}
