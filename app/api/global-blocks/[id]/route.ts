/**
 * Single Global Block API Routes
 *
 * GET /api/global-blocks/[id] - Get a single global block
 * PUT /api/global-blocks/[id] - Update a global block
 * DELETE /api/global-blocks/[id] - Soft delete (set isActive = false)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthContext, requireContentEditor, AuthError } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { globalBlockSchema, formatZodError } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import type { ApiResponse } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/global-blocks/[id]
 * Get a single global block by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authContext = await requireAuthContext();
    const db = getTenantPrisma(authContext.church.id);

    const globalBlock = await db.globalBlock.findFirst({
      where: { id, isActive: true },
    });

    if (!globalBlock) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Global block not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { globalBlock },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to get global block", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to load global block" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/global-blocks/[id]
 * Update a global block
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Check global block exists
    const existing = await db.globalBlock.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Global block not found" },
        { status: 404 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parseResult = globalBlockSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: formatZodError(parseResult.error) },
        { status: 400 }
      );
    }

    const { name, description, blockContent } = parseResult.data;

    // Check for duplicate name if name changed
    if (name !== existing.name) {
      const duplicate = await db.globalBlock.findFirst({
        where: { name, isActive: true, id: { not: id } },
      });
      if (duplicate) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "A global block with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update the global block
    const globalBlock = await db.globalBlock.update({
      where: { id },
      data: {
        name,
        description: description || null,
        blockContent,
      },
    });

    logger.info("Global block updated", { globalBlockId: id, churchId: user.churchId });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { globalBlock },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to update global block", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update global block" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/global-blocks/[id]
 * Soft delete a global block (set isActive = false)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Check global block exists
    const existing = await db.globalBlock.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Global block not found" },
        { status: 404 }
      );
    }

    // Soft delete
    await db.globalBlock.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info("Global block deleted", { globalBlockId: id, churchId: user.churchId });

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to delete global block", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete global block" },
      { status: 500 }
    );
  }
}
