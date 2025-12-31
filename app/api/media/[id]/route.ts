/**
 * Individual Media API Routes
 *
 * GET /api/media/[id] - Get a single media item
 * PATCH /api/media/[id] - Update media metadata (alt text)
 * DELETE /api/media/[id] - Soft delete a media item
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthContext, requireContentEditor, AuthError } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { mediaUpdateSchema, formatZodError } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import { storage } from "@/lib/storage";
import { deleteImageWithVariants } from "@/lib/storage/image";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/media/[id]
 * Get a single media item
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const context = await requireAuthContext();
    const db = getTenantPrisma(context.church.id);

    const media = await db.media.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        storagePath: true,
        variants: true,
        alt: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!media || media.deletedAt) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    // Add URLs
    const url = storage.getUrl(media.storagePath);
    const variantUrls = media.variants
      ? Object.fromEntries(
          Object.entries(media.variants as Record<string, { path: string }>).map(
            ([name, variant]) => [name, storage.getUrl(variant.path)]
          )
        )
      : null;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        media: {
          ...media,
          url,
          variantUrls,
        },
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to get media", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to load media" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/media/[id]
 * Update media metadata (alt text)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Check if media exists and belongs to tenant
    const existing = await db.media.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parseResult = mediaUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: formatZodError(parseResult.error) },
        { status: 400 }
      );
    }

    const { alt } = parseResult.data;

    // Update media
    const media = await db.media.update({
      where: { id },
      data: { alt },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        storagePath: true,
        variants: true,
        alt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info("Media updated", { mediaId: id, churchId: user.churchId });

    // Add URLs
    const url = storage.getUrl(media.storagePath);
    const variantUrls = media.variants
      ? Object.fromEntries(
          Object.entries(media.variants as Record<string, { path: string }>).map(
            ([name, variant]) => [name, storage.getUrl(variant.path)]
          )
        )
      : null;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        media: {
          ...media,
          url,
          variantUrls,
        },
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to update media", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update media" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media/[id]
 * Soft delete a media item (sets deletedAt timestamp)
 * To permanently delete, use ?permanent=true
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Check query param for permanent delete
    const permanent = request.nextUrl.searchParams.get("permanent") === "true";

    // Check if media exists and belongs to tenant
    const existing = await db.media.findUnique({
      where: { id },
      select: {
        id: true,
        storagePath: true,
        variants: true,
        deletedAt: true,
      },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    if (permanent) {
      // Permanently delete: remove from storage and database
      try {
        await deleteImageWithVariants(
          existing.storagePath,
          existing.variants as Record<string, { path: string }> | undefined
        );
      } catch (storageError) {
        // Log but continue - file might already be deleted
        logger.warn("Failed to delete media files from storage", {
          mediaId: id,
          error: storageError instanceof Error ? storageError.message : "Unknown error",
        });
      }

      await db.media.delete({ where: { id } });

      logger.info("Media permanently deleted", {
        mediaId: id,
        churchId: user.churchId,
      });
    } else {
      // Soft delete: just set deletedAt
      await db.media.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      logger.info("Media soft deleted", {
        mediaId: id,
        churchId: user.churchId,
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { deleted: true, permanent },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to delete media", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
