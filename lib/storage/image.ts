/**
 * Image Processing Utilities
 *
 * Handles image resizing using sharp.
 * Creates multiple variants for responsive images.
 */

import sharp from "sharp";
import {
  ImageVariant,
  IMAGE_VARIANTS,
  ProcessedImage,
  UploadOptions,
  isImageType,
} from "./types";
import { storage } from "./index";

/**
 * Generate a unique filename for uploads
 */
export function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Get the variant filename from original filename
 */
function getVariantFilename(filename: string, variantName: string): string {
  const parts = filename.split(".");
  const ext = parts.pop();
  return `${parts.join(".")}-${variantName}.${ext}`;
}

/**
 * Resize an image to specified dimensions
 */
async function resizeImage(
  buffer: Buffer,
  variant: ImageVariant,
  mimeType: string
): Promise<Buffer> {
  let pipeline = sharp(buffer).resize({
    width: variant.width,
    height: variant.height,
    fit: "inside",
    withoutEnlargement: true,
  });

  // Apply format-specific options
  const quality = variant.quality || 85;

  switch (mimeType) {
    case "image/jpeg":
      pipeline = pipeline.jpeg({ quality, progressive: true });
      break;
    case "image/png":
      pipeline = pipeline.png({ quality, progressive: true });
      break;
    case "image/webp":
      pipeline = pipeline.webp({ quality });
      break;
    default:
      // Default to JPEG for unknown types
      pipeline = pipeline.jpeg({ quality, progressive: true });
  }

  return pipeline.toBuffer();
}

/**
 * Process and upload an image with variants
 *
 * @param buffer - Original image buffer
 * @param originalFilename - Original filename for extension detection
 * @param mimeType - Image mime type
 * @param folder - Target folder in storage
 * @returns Processed image with original and variant URLs
 */
export async function processAndUploadImage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder: string
): Promise<ProcessedImage> {
  if (!isImageType(mimeType)) {
    throw new Error(`Invalid image type: ${mimeType}`);
  }

  // Generate unique filename
  const filename = generateFilename(originalFilename);

  // Upload original
  const originalOptions: UploadOptions = {
    folder,
    filename,
    contentType: mimeType,
  };
  const original = await storage.upload(buffer, originalOptions);

  // Create and upload variants
  const variants: Record<string, { path: string; url: string }> = {};

  for (const variant of IMAGE_VARIANTS) {
    try {
      const resizedBuffer = await resizeImage(buffer, variant, mimeType);
      const variantFilename = getVariantFilename(filename, variant.name);

      const variantOptions: UploadOptions = {
        folder,
        filename: variantFilename,
        contentType: mimeType,
      };

      const result = await storage.upload(resizedBuffer, variantOptions);
      variants[variant.name] = result;
    } catch (error) {
      console.error(`Failed to create ${variant.name} variant:`, error);
      // Continue with other variants even if one fails
    }
  }

  return {
    original,
    variants,
  };
}

/**
 * Delete an image and all its variants
 */
export async function deleteImageWithVariants(
  storagePath: string,
  variants?: Record<string, { path: string }>
): Promise<void> {
  // Delete original
  await storage.delete(storagePath);

  // Delete variants if provided
  if (variants) {
    for (const variant of Object.values(variants)) {
      if (variant.path) {
        await storage.delete(variant.path);
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
