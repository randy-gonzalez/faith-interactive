/**
 * Individual Prayer Request API Routes
 *
 * GET /api/prayer-requests/[id] - Get a single prayer request
 * PATCH /api/prayer-requests/[id] - Update prayer request (mark read/archived)
 * DELETE /api/prayer-requests/[id] - Delete a prayer request
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
const prayerRequestUpdateSchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

/**
 * GET /api/prayer-requests/[id]
 * Get a single prayer request
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    const prayerRequest = await db.prayerRequest.findUnique({
      where: { id },
    });

    if (!prayerRequest) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Prayer request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { prayerRequest },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to get prayer request", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to load prayer request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/prayer-requests/[id]
 * Update prayer request status (read/archived)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Check if prayer request exists
    const existing = await db.prayerRequest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Prayer request not found" },
        { status: 404 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parseResult = prayerRequestUpdateSchema.safeParse(body);

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

    const prayerRequest = await db.prayerRequest.update({
      where: { id },
      data: updateData,
    });

    logger.info("Prayer request updated", { id, churchId: user.churchId, updates: parseResult.data });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { prayerRequest },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to update prayer request", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update prayer request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prayer-requests/[id]
 * Permanently delete a prayer request
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Check if prayer request exists
    const existing = await db.prayerRequest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Prayer request not found" },
        { status: 404 }
      );
    }

    await db.prayerRequest.delete({ where: { id } });

    logger.info("Prayer request deleted", { id, churchId: user.churchId });

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
    logger.error("Failed to delete prayer request", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete prayer request" },
      { status: 500 }
    );
  }
}
