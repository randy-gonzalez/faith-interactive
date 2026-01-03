/**
 * Media Types
 *
 * Type definitions for media library and image variants.
 */

/**
 * Single image variant information
 */
export interface ImageVariantInfo {
  /** Storage path relative to root */
  path: string;
  /** Actual width in pixels */
  width: number;
  /** Actual height in pixels */
  height: number;
  /** File size in bytes */
  size: number;
}

/**
 * All available variants for an image
 */
export interface ImageVariants {
  /** Full size WebP (max 2048px, aspect ratio preserved) */
  full?: ImageVariantInfo;
  /** Large responsive (1200px wide, aspect ratio preserved) */
  large?: ImageVariantInfo;
  /** Medium responsive (800px wide, aspect ratio preserved) */
  medium?: ImageVariantInfo;
  /** Small responsive (400px wide, aspect ratio preserved) */
  small?: ImageVariantInfo;
  /** Large square crop (1200x1200, center cropped) */
  "large-square"?: ImageVariantInfo;
  /** Medium square crop (800x800, center cropped) */
  "medium-square"?: ImageVariantInfo;
  /** Small square crop (400x400, center cropped) */
  "small-square"?: ImageVariantInfo;
}

/**
 * Variant names as a type
 */
export type VariantName = keyof ImageVariants;

/**
 * Complete metadata stored in the database for images
 */
export interface MediaMetadata {
  /** Original image dimensions */
  original: {
    width: number;
    height: number;
  };
  /** All generated variants */
  variants: ImageVariants;
  /** Whether this is an animated GIF (no variants generated) */
  isAnimated?: boolean;
}

/**
 * Media item with resolved URLs (for API responses)
 */
export interface MediaWithUrls {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  storagePath: string;
  alt: string | null;
  createdAt: Date;
  /** URL for the original file */
  url: string;
  /** Original dimensions */
  originalDimensions?: {
    width: number;
    height: number;
  };
  /** Whether this is an animated GIF */
  isAnimated?: boolean;
  /** URLs for all variants (keyed by variant name) */
  variantUrls: Record<string, string> | null;
  /** Full variant info including dimensions */
  variants: ImageVariants | null;
  uploadedBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

/**
 * Result from image processing
 */
export interface ProcessedImageResult {
  /** Original file upload result */
  original: {
    path: string;
    url: string;
  };
  /** Original dimensions */
  originalDimensions: {
    width: number;
    height: number;
  };
  /** Whether this is an animated image */
  isAnimated: boolean;
  /** All variants with full info */
  variants: ImageVariants;
}
