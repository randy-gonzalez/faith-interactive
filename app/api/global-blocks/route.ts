/**
 * Global Blocks API Routes
 *
 * GET /api/global-blocks - List all global blocks for the church
 * POST /api/global-blocks - Create a new global block
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthContext, requireContentEditor, AuthError } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { globalBlockSchema, formatZodError } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import type { ApiResponse } from "@/types";

/**
 * GET /api/global-blocks
 * List all active global blocks for the current church
 */
export async function GET() {
  try {
    const context = await requireAuthContext();
    const db = getTenantPrisma(context.church.id);

    const globalBlocks = await db.globalBlock.findMany({
      where: { isActive: true },
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        blockContent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { globalBlocks },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to list global blocks", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to load global blocks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/global-blocks
 * Create a new global block
 */
export async function POST(request: NextRequest) {
  try {
    // Require editor or admin role
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

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

    // Check for duplicate name (within church)
    const existing = await db.globalBlock.findFirst({
      where: { name, isActive: true },
    });

    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "A global block with this name already exists" },
        { status: 400 }
      );
    }

    // Create the global block
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalBlock = await (db.globalBlock.create as any)({
      data: {
        name,
        description: description || null,
        blockContent,
      },
    });

    logger.info("Global block created", { globalBlockId: globalBlock.id, churchId: user.churchId });

    return NextResponse.json<ApiResponse>(
      { success: true, data: { globalBlock } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to create global block", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to create global block" },
      { status: 500 }
    );
  }
}
