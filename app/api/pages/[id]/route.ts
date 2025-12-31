/**
 * Single Page API Routes
 *
 * GET /api/pages/[id] - Get a single page
 * PUT /api/pages/[id] - Update a page
 * DELETE /api/pages/[id] - Delete a page
 * POST /api/pages/[id]/publish - Publish a page
 * POST /api/pages/[id]/unpublish - Unpublish a page
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthContext, requireContentEditor, AuthError } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { pageSchema, formatZodError } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import type { ApiResponse } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/pages/[id]
 * Get a single page by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authContext = await requireAuthContext();
    const db = getTenantPrisma(authContext.church.id);

    const page = await db.page.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { page },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to get page", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to load page" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pages/[id]
 * Update a page
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Check page exists
    const existing = await db.page.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parseResult = pageSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: formatZodError(parseResult.error) },
        { status: 400 }
      );
    }

    const { title, body: content, urlPath, featuredImageUrl } = parseResult.data;

    // Check for duplicate urlPath if changed
    if (urlPath && urlPath !== existing.urlPath) {
      const duplicate = await db.page.findFirst({
        where: { urlPath, id: { not: id } },
      });
      if (duplicate) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "A page with this URL path already exists" },
          { status: 400 }
        );
      }
    }

    // Update the page
    const page = await db.page.update({
      where: { id },
      data: {
        title,
        body: content,
        urlPath: urlPath || null,
        featuredImageUrl: featuredImageUrl || null,
      },
    });

    logger.info("Page updated", { pageId: page.id, churchId: user.churchId });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { page },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to update page", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update page" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pages/[id]
 * Delete a page
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Check page exists
    const existing = await db.page.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    await db.page.delete({
      where: { id },
    });

    logger.info("Page deleted", { pageId: id, churchId: user.churchId });

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
    logger.error("Failed to delete page", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete page" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pages/[id]
 * Publish or unpublish a page
 * Body: { action: "publish" | "unpublish" }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Check page exists
    const existing = await db.page.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const action = body.action;

    if (action !== "publish" && action !== "unpublish") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid action. Use 'publish' or 'unpublish'" },
        { status: 400 }
      );
    }

    let page;
    if (action === "publish") {
      // Set to published, set publishedAt if not already set
      page = await db.page.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: existing.publishedAt || new Date(),
        },
      });
      logger.info("Page published", { pageId: id, churchId: user.churchId });
    } else {
      // Set to draft, keep publishedAt for history
      page = await db.page.update({
        where: { id },
        data: {
          status: "DRAFT",
        },
      });
      logger.info("Page unpublished", { pageId: id, churchId: user.churchId });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { page },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to update page status", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update page status" },
      { status: 500 }
    );
  }
}
