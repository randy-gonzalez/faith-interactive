/**
 * Cloudflare Images-based image processing
 *
 * Uses the Cloudflare Images binding to transform images in Workers.
 * This replaces Sharp for production deployments on Cloudflare.
 *
 * @see https://developers.cloudflare.com/images/transform-images/bindings/
 */

import { IMAGE_VARIANTS, IMAGE_SQUARE_VARIANTS, ImageVariant } from "./types";

/**
 * Cloudflare Images binding interface
 */
export interface CloudflareImagesBinding {
  input(stream: ReadableStream): ImageTransformer;
}

interface ImageTransformer {
  transform(options: TransformOptions): ImageTransformer;
  output(options: OutputOptions): Promise<TransformResult>;
  info(): Promise<ImageInfo>;
}

interface TransformOptions {
  width?: number;
  height?: number;
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  rotate?: 90 | 180 | 270;
  blur?: number;
}

interface OutputOptions {
  format?: "image/webp" | "image/avif" | "image/jpeg" | "image/png";
  quality?: number;
}

interface TransformResult {
  response(): Response;
}

interface ImageInfo {
  format: string;
  width: number;
  height: number;
  fileSize: number;
}

/**
 * Result of processing a single variant
 */
export interface VariantResult {
  name: string;
  buffer: Buffer;
  width: number;
  height: number;
}

/**
 * Result of processing all variants
 */
export interface CloudflareProcessResult {
  dimensions: { width: number; height: number };
  variants: VariantResult[];
}

/**
 * Convert a Buffer to a ReadableStream
 */
function bufferToStream(buffer: Buffer): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(buffer));
      controller.close();
    },
  });
}

/**
 * Convert a ReadableStream to a Buffer
 */
async function streamToBuffer(
  stream: ReadableStream<Uint8Array> | null
): Promise<Buffer> {
  if (!stream) {
    throw new Error("No stream provided");
  }

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

/**
 * Get image dimensions using Cloudflare Images
 */
export async function getImageDimensionsCloudflare(
  buffer: Buffer,
  images: CloudflareImagesBinding
): Promise<{ width: number; height: number }> {
  try {
    const info = await images.input(bufferToStream(buffer)).info();
    return { width: info.width, height: info.height };
  } catch (error) {
    console.error("Failed to get image dimensions:", error);
    return { width: 0, height: 0 };
  }
}

/**
 * Check if a GIF is animated using Cloudflare Images
 * Note: Cloudflare Images doesn't directly expose frame count,
 * so we use a heuristic based on file size for GIFs
 */
export async function isAnimatedGifCloudflare(
  buffer: Buffer,
  mimeType: string
): Promise<boolean> {
  // Simple heuristic: GIFs larger than 100KB are likely animated
  // This isn't perfect but avoids processing animated GIFs
  if (mimeType === "image/gif" && buffer.length > 100 * 1024) {
    return true;
  }
  return false;
}

/**
 * Process a single responsive variant (maintains aspect ratio)
 */
async function processResponsiveVariant(
  buffer: Buffer,
  variant: ImageVariant,
  images: CloudflareImagesBinding
): Promise<VariantResult> {
  const result = await images
    .input(bufferToStream(buffer))
    .transform({
      width: variant.width,
      fit: "scale-down", // Maintains aspect ratio, never enlarges
    })
    .output({
      format: "image/webp",
      quality: variant.quality || 85,
    });

  const response = result.response();
  const variantBuffer = await streamToBuffer(response.body);

  // Get dimensions of the processed image
  const info = await images.input(bufferToStream(variantBuffer)).info();

  return {
    name: variant.name,
    buffer: variantBuffer,
    width: info.width,
    height: info.height,
  };
}

/**
 * Process a single square crop variant (center crop to 1:1)
 */
async function processSquareVariant(
  buffer: Buffer,
  variant: ImageVariant,
  images: CloudflareImagesBinding
): Promise<VariantResult> {
  const size = variant.width; // For square, width === height

  const result = await images
    .input(bufferToStream(buffer))
    .transform({
      width: size,
      height: size,
      fit: "cover", // Center crop to fill dimensions
    })
    .output({
      format: "image/webp",
      quality: variant.quality || 85,
    });

  const response = result.response();
  const variantBuffer = await streamToBuffer(response.body);

  return {
    name: variant.name,
    buffer: variantBuffer,
    width: size,
    height: size,
  };
}

/**
 * Process an image and create all variants using Cloudflare Images
 *
 * @param buffer - Original image buffer
 * @param images - Cloudflare Images binding
 * @returns Processed variants and original dimensions
 */
export async function processImageWithCloudflare(
  buffer: Buffer,
  images: CloudflareImagesBinding
): Promise<CloudflareProcessResult> {
  // Get original dimensions
  const dimensions = await getImageDimensionsCloudflare(buffer, images);

  const variants: VariantResult[] = [];

  // Process responsive variants (maintain aspect ratio)
  for (const variant of IMAGE_VARIANTS) {
    try {
      const result = await processResponsiveVariant(buffer, variant, images);
      variants.push(result);
    } catch (error) {
      console.error(`Failed to create ${variant.name} variant:`, error);
      // Continue with other variants even if one fails
    }
  }

  // Process square crop variants
  for (const variant of IMAGE_SQUARE_VARIANTS) {
    try {
      const result = await processSquareVariant(buffer, variant, images);
      variants.push(result);
    } catch (error) {
      console.error(`Failed to create ${variant.name} variant:`, error);
      // Continue with other variants even if one fails
    }
  }

  return { dimensions, variants };
}
