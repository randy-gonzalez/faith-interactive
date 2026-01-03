/**
 * Image Processing Utilities
 *
 * Handles image resizing and format conversion using sharp.
 * Creates multiple variants for responsive images and square crops.
 * Outputs WebP format for optimal compression.
 */

import sharp from "sharp";
import {
  ImageVariant,
  IMAGE_VARIANTS,
  IMAGE_SQUARE_VARIANTS,
  UploadOptions,
  isImageType,
} from "./types";
import { storage } from "./index";
import type {
  ImageVariantInfo,
  ImageVariants,
  ProcessedImageResult,
} from "@/types/media";

/**
 * Generate a unique base filename for uploads (without extension)
 */
export function generateBaseFilename(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Generate a unique filename for uploads (with original extension)
 */
export function generateFilename(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `${generateBaseFilename()}.${ext}`;
}

/**
 * Get the variant filename from base filename
 */
function getVariantFilename(baseFilename: string, variantName: string): string {
  // For square variants, include dimensions in filename
  if (variantName.includes("square")) {
    const size = variantName.replace("-square", "");
    const dimension =
      size === "large" ? "1200x1200" : size === "medium" ? "800x800" : "400x400";
    return `${baseFilename}-${dimension}.webp`;
  }
  // For responsive variants, just use width
  const width =
    variantName === "full"
      ? "full"
      : variantName === "large"
        ? "1200"
        : variantName === "medium"
          ? "800"
          : "400";
  return `${baseFilename}-${width}.webp`;
}

/**
 * Check if a GIF is animated (has multiple frames)
 */
async function isAnimatedGif(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata();
    // GIFs with multiple pages are animated
    return metadata.format === "gif" && (metadata.pages ?? 1) > 1;
  } catch {
    return false;
  }
}

/**
 * Resize an image maintaining aspect ratio, output as WebP
 */
async function resizeImageToWebp(
  buffer: Buffer,
  variant: ImageVariant
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const resized = await sharp(buffer)
    .resize({
      width: variant.width,
      height: variant.height,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: variant.quality || 85,
      effort: 4,
    })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: resized.data,
    width: resized.info.width,
    height: resized.info.height,
  };
}

/**
 * Create a center-cropped square image, output as WebP
 */
async function cropSquareToWebp(
  buffer: Buffer,
  variant: ImageVariant
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const size = variant.width; // For square, width === height
  const cropped = await sharp(buffer)
    .resize({
      width: size,
      height: size,
      fit: "cover",
      position: "center",
    })
    .webp({
      quality: variant.quality || 85,
      effort: 4,
    })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: cropped.data,
    width: cropped.info.width,
    height: cropped.info.height,
  };
}

/**
 * Process and upload an image with all variants
 *
 * @param buffer - Original image buffer
 * @param originalFilename - Original filename for extension detection
 * @param mimeType - Image mime type
 * @param folder - Target folder in storage
 * @returns Processed image with original, dimensions, and all variants
 */
export async function processAndUploadImage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder: string
): Promise<ProcessedImageResult> {
  if (!isImageType(mimeType)) {
    throw new Error(`Invalid image type: ${mimeType}`);
  }

  // Get original dimensions
  const originalMetadata = await sharp(buffer).metadata();
  const originalDimensions = {
    width: originalMetadata.width || 0,
    height: originalMetadata.height || 0,
  };

  // Check if it's an animated GIF
  const isAnimated = mimeType === "image/gif" && (await isAnimatedGif(buffer));

  // Generate base filename (without extension)
  const baseFilename = generateBaseFilename();
  const originalExt = originalFilename.split(".").pop()?.toLowerCase() || "jpg";
  const originalFilenameWithExt = `${baseFilename}.${originalExt}`;

  // Upload original (unchanged)
  const originalOptions: UploadOptions = {
    folder,
    filename: originalFilenameWithExt,
    contentType: mimeType,
  };
  const original = await storage.upload(buffer, originalOptions);

  // For animated GIFs, skip variant generation
  if (isAnimated) {
    return {
      original,
      originalDimensions,
      isAnimated: true,
      variants: {},
    };
  }

  // Create and upload all variants
  const variants: ImageVariants = {};

  // Process responsive variants (maintain aspect ratio)
  for (const variant of IMAGE_VARIANTS) {
    try {
      const result = await resizeImageToWebp(buffer, variant);
      const variantFilename = getVariantFilename(baseFilename, variant.name);

      const variantOptions: UploadOptions = {
        folder,
        filename: variantFilename,
        contentType: "image/webp",
      };

      const uploadResult = await storage.upload(result.buffer, variantOptions);

      const variantInfo: ImageVariantInfo = {
        path: uploadResult.path,
        width: result.width,
        height: result.height,
        size: result.buffer.length,
      };

      variants[variant.name as keyof ImageVariants] = variantInfo;
    } catch (error) {
      console.error(`Failed to create ${variant.name} variant:`, error);
      // Continue with other variants even if one fails
    }
  }

  // Process square crop variants (center crop)
  for (const variant of IMAGE_SQUARE_VARIANTS) {
    try {
      const result = await cropSquareToWebp(buffer, variant);
      const variantFilename = getVariantFilename(baseFilename, variant.name);

      const variantOptions: UploadOptions = {
        folder,
        filename: variantFilename,
        contentType: "image/webp",
      };

      const uploadResult = await storage.upload(result.buffer, variantOptions);

      const variantInfo: ImageVariantInfo = {
        path: uploadResult.path,
        width: result.width,
        height: result.height,
        size: result.buffer.length,
      };

      variants[variant.name as keyof ImageVariants] = variantInfo;
    } catch (error) {
      console.error(`Failed to create ${variant.name} variant:`, error);
      // Continue with other variants even if one fails
    }
  }

  return {
    original,
    originalDimensions,
    isAnimated: false,
    variants,
  };
}

/**
 * Delete an image and all its variants
 */
export async function deleteImageWithVariants(
  storagePath: string,
  variants?: ImageVariants | Record<string, { path: string }> | null
): Promise<void> {
  // Delete original
  await storage.delete(storagePath);

  // Delete variants if provided
  if (variants) {
    for (const variant of Object.values(variants)) {
      if (variant && "path" in variant && variant.path) {
        try {
          await storage.delete(variant.path);
        } catch (error) {
          console.error(`Failed to delete variant ${variant.path}:`, error);
        }
      }
    }
  }
}

/**
 * Get image dimensions from a buffer
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
