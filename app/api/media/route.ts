/**
 * Media API Routes
 *
 * GET /api/media - List media files
 * POST /api/media - Upload new media
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthContext, requireContentEditor, AuthError } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";
import { storage } from "@/lib/storage";
import { processAndUploadImage } from "@/lib/storage/image";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_PDF_TYPE,
  isImageType,
  getFileSizeLimit,
} from "@/lib/storage/types";
import type { ApiResponse } from "@/types";
import type { ImageVariants, MediaMetadata } from "@/types/media";

/**
 * GET /api/media
 * List all media for the current church
 * Supports filtering by type (image/pdf) and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const context = await requireAuthContext();
    const db = getTenantPrisma(context.church.id);

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // "image" | "pdf" | null
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      deletedAt: null, // Only show non-deleted media
    };

    if (type === "image") {
      where.mimeType = { in: ALLOWED_IMAGE_TYPES };
    } else if (type === "pdf") {
      where.mimeType = ALLOWED_PDF_TYPE;
    }

    // Get total count and media items
    const [total, media] = await Promise.all([
      db.media.count({ where }),
      db.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          filename: true,
          mimeType: true,
          size: true,
          storagePath: true,
          variants: true,
          alt: true,
          createdAt: true,
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Transform media to include URLs
    const mediaWithUrls = media.map((item) => {
      const metadata = item.variants as MediaMetadata | null;
      const variants = metadata?.variants as ImageVariants | undefined;

      // Build variant URLs
      const variantUrls = variants
        ? Object.fromEntries(
            Object.entries(variants)
              .filter(([, v]) => v?.path)
              .map(([name, v]) => [name, storage.getUrl(v!.path)])
          )
        : null;

      return {
        ...item,
        url: storage.getUrl(item.storagePath),
        originalDimensions: metadata?.original || null,
        isAnimated: metadata?.isAnimated || false,
        variants: variants || null,
        variantUrls,
      };
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        media: mediaWithUrls,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
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
    logger.error("Failed to list media", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to load media" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/media
 * Upload a new media file
 * Accepts multipart/form-data with a "file" field
 */
export async function POST(request: NextRequest) {
  try {
    // Require editor or admin role
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const alt = formData.get("alt") as string | null;

    if (!file) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const mimeType = file.type;
    const isImage = isImageType(mimeType);
    const isPdf = mimeType === ALLOWED_PDF_TYPE;

    if (!isImage && !isPdf) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Invalid file type. Allowed: ${[...ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPE].join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = getFileSizeLimit(mimeType);
    if (file.size > maxSize) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Define folder based on church
    const folder = `media/${user.churchId}`;

    let storagePath: string;
    let url: string;
    let metadata: MediaMetadata | null = null;

    if (isImage) {
      // Process image: create variants and upload all
      const result = await processAndUploadImage(buffer, file.name, mimeType, folder);
      storagePath = result.original.path;
      url = result.original.url;

      // Build metadata structure for database
      metadata = {
        original: result.originalDimensions,
        variants: result.variants,
        isAnimated: result.isAnimated,
      };
    } else {
      // Upload PDF directly
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const filename = `${timestamp}-${random}.pdf`;

      const result = await storage.upload(buffer, {
        folder,
        filename,
        contentType: mimeType,
      });
      storagePath = result.path;
      url = result.url;
    }

    // Store in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const media = await (db.media.create as any)({
      data: {
        uploadedById: user.id,
        filename: file.name,
        mimeType,
        size: file.size,
        storagePath,
        variants: metadata, // Store full metadata including original dimensions
        alt: alt || null,
      },
    });

    logger.info("Media uploaded", {
      mediaId: media.id,
      churchId: user.churchId,
      filename: file.name,
      mimeType,
      size: file.size,
      isAnimated: metadata?.isAnimated,
      variantCount: metadata?.variants ? Object.keys(metadata.variants).length : 0,
    });

    // Build variant URLs for response
    const variantUrls = metadata?.variants
      ? Object.fromEntries(
          Object.entries(metadata.variants)
            .filter(([, v]) => v?.path)
            .map(([name, v]) => [name, storage.getUrl(v!.path)])
        )
      : null;

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          media: {
            id: media.id,
            filename: media.filename,
            mimeType: media.mimeType,
            size: media.size,
            storagePath: media.storagePath,
            alt: media.alt,
            url,
            originalDimensions: metadata?.original || null,
            isAnimated: metadata?.isAnimated || false,
            variants: metadata?.variants || null,
            variantUrls,
            createdAt: media.createdAt,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to upload media", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
