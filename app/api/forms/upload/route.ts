/**
 * Form File Upload API Route
 *
 * POST /api/forms/upload - Upload a file for form submission (public, rate-limited)
 *
 * Files are temporarily stored until the form is submitted. Orphaned files
 * (not linked to a submission within 24 hours) are cleaned up automatically.
 *
 * Security measures:
 * - File type validation
 * - File size limits (10MB max)
 * - Rate limiting per IP
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/security/rate-limit";
import { storage } from "@/lib/storage";
import { DEFAULT_FILE_CONFIG, validateFileUpload } from "@/types/forms";
import type { ApiResponse } from "@/types";

/**
 * POST /api/forms/upload
 * Upload a file for form submission. Public endpoint with rate limiting.
 * Returns a file ID that can be included in the form submission.
 */
export async function POST(request: NextRequest) {
  try {
    const headerStore = await headers();
    const churchSlug = headerStore.get("x-church-slug");

    if (!churchSlug) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    // Get church from slug
    const church = await prisma.church.findUnique({
      where: { slug: churchSlug },
    });

    if (!church) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Church not found" },
        { status: 404 }
      );
    }

    // Get client IP for rate limiting
    const forwardedFor = headerStore.get("x-forwarded-for");
    const realIp = headerStore.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

    // Rate limit: 10 uploads per minute per IP
    const rateLimitResult = checkRateLimit(clientIp, "/api/forms/upload", {
      max: 10,
      windowSeconds: 60,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Too many uploads. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No file provided" },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate file against default config
    const validation = validateFileUpload(
      { size: file.size, type: file.type },
      DEFAULT_FILE_CONFIG
    );

    if (!validation.valid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.error },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = getFileExtension(file.name, file.type);
    const filename = `${timestamp}-${random}${extension}`;

    // Store file in form-uploads folder for this church
    const folder = `form-uploads/${church.id}`;
    const result = await storage.upload(buffer, {
      folder,
      filename,
      contentType: file.type,
    });

    // Create database record with 24-hour expiration
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const db = getTenantPrisma(church.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formFile = await (db.formFile.create as any)({
      data: {
        filename: file.name,
        storedPath: result.path,
        mimeType: file.type,
        size: file.size,
        expiresAt,
      },
    });

    logger.info("Form file uploaded", {
      fileId: formFile.id,
      churchId: church.id,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          fileId: formFile.id,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        },
      },
      { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    logger.error("Form file upload failed", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Get file extension from filename or MIME type
 */
function getFileExtension(filename: string, mimeType: string): string {
  // Try to get from filename first
  const filenameExt = filename.includes(".") ? `.${filename.split(".").pop()}` : "";
  if (filenameExt) return filenameExt.toLowerCase();

  // Fallback to MIME type mapping
  const mimeExtensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  };

  return mimeExtensions[mimeType] || "";
}
