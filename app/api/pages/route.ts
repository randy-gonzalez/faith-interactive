/**
 * Pages API Routes
 *
 * GET /api/pages - List all pages
 * POST /api/pages - Create a new page
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthContext, requireContentEditor, AuthError } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { pageSchema, formatZodError } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import type { ApiResponse } from "@/types";

/**
 * GET /api/pages
 * List all pages for the current church
 */
export async function GET() {
  try {
    const context = await requireAuthContext();
    const db = getTenantPrisma(context.church.id);

    const pages = await db.page.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        urlPath: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { pages },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to list pages", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to load pages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pages
 * Create a new page
 */
export async function POST(request: NextRequest) {
  try {
    // Require editor or admin role
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

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

    // Check for duplicate urlPath if provided
    if (urlPath) {
      const existing = await db.page.findFirst({
        where: { urlPath },
      });
      if (existing) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "A page with this URL path already exists" },
          { status: 400 }
        );
      }
    }

    // Create the page (default status is DRAFT)
    // churchId is automatically injected by tenant-prisma extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await (db.page.create as any)({
      data: {
        title,
        body: content,
        urlPath: urlPath || null,
        featuredImageUrl: featuredImageUrl || null,
      },
    });

    logger.info("Page created", { pageId: page.id, churchId: user.churchId });

    return NextResponse.json<ApiResponse>(
      { success: true, data: { page } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to create page", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to create page" },
      { status: 500 }
    );
  }
}
