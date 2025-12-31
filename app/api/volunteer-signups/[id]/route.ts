/**
 * Individual Volunteer Signup API Routes
 *
 * GET /api/volunteer-signups/[id] - Get a single volunteer signup
 * PATCH /api/volunteer-signups/[id] - Update volunteer signup (mark read/archived)
 * DELETE /api/volunteer-signups/[id] - Delete a volunteer signup
 */

import { NextRequest, NextResponse } from "next/server";
import { requireContentEditor, AuthError } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Schema for PATCH updates
const volunteerSignupUpdateSchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

/**
 * GET /api/volunteer-signups/[id]
 * Get a single volunteer signup
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    const volunteerSignup = await db.volunteerSignup.findUnique({
      where: { id },
    });

    if (!volunteerSignup) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Volunteer signup not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { volunteerSignup },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to get volunteer signup", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to load volunteer signup" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/volunteer-signups/[id]
 * Update volunteer signup status (read/archived)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Check if volunteer signup exists
    const existing = await db.volunteerSignup.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Volunteer signup not found" },
        { status: 404 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parseResult = volunteerSignupUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid update data" },
        { status: 400 }
      );
    }

    const { isRead, isArchived } = parseResult.data;

    // Build update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (isRead !== undefined) {
      updateData.isRead = isRead;
    }
    if (isArchived !== undefined) {
      updateData.isArchived = isArchived;
      updateData.archivedAt = isArchived ? new Date() : null;
    }

    const volunteerSignup = await db.volunteerSignup.update({
      where: { id },
      data: updateData,
    });

    logger.info("Volunteer signup updated", { id, churchId: user.churchId, updates: parseResult.data });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { volunteerSignup },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to update volunteer signup", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update volunteer signup" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/volunteer-signups/[id]
 * Permanently delete a volunteer signup
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Check if volunteer signup exists
    const existing = await db.volunteerSignup.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Volunteer signup not found" },
        { status: 404 }
      );
    }

    await db.volunteerSignup.delete({ where: { id } });

    logger.info("Volunteer signup deleted", { id, churchId: user.churchId });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to delete volunteer signup", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete volunteer signup" },
      { status: 500 }
    );
  }
}
