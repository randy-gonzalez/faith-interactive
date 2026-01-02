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
import { isReservedSlug } from "@/lib/constants/reserved-slugs";
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
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        urlPath: true,
        parentId: true,
        sortOrder: true,
        status: true,
        isHomePage: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
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

    const {
      title,
      blocks,
      urlPath,
      featuredImageUrl,
      parentId,
      sortOrder,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      noIndex,
      isHomePage,
    } = parseResult.data;

    // Check for reserved slugs
    if (urlPath && isReservedSlug(urlPath)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `The URL path "${urlPath}" is reserved and cannot be used` },
        { status: 400 }
      );
    }

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

    // Validate parentId if provided (must exist and belong to same church)
    if (parentId) {
      const parentPage = await db.page.findFirst({
        where: { id: parentId },
      });
      if (!parentPage) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Parent page not found" },
          { status: 400 }
        );
      }
    }

    // If setting this page as homepage, first unset any existing homepage
    if (isHomePage) {
      await db.page.updateMany({
        where: { isHomePage: true },
        data: { isHomePage: false },
      });
    }

    // Create the page (default status is DRAFT)
    // churchId is automatically injected by tenant-prisma extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await (db.page.create as any)({
      data: {
        title,
        blocks: blocks || [],
        urlPath: urlPath || null,
        featuredImageUrl: featuredImageUrl || null,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        ogImage: ogImage || null,
        noIndex: noIndex || false,
        isHomePage: isHomePage || false,
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
