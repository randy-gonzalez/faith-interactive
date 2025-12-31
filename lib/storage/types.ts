/**
 * Storage Types
 *
 * Defines the interface for storage providers (local filesystem or S3-compatible).
 */

/**
 * Result of an upload operation
 */
export interface UploadResult {
  /** Relative path to the stored file */
  path: string;
  /** Public URL for the file */
  url: string;
}

/**
 * Options for upload operations
 */
export interface UploadOptions {
  /** Target folder path (relative to storage root) */
  folder: string;
  /** Filename to use (without path) */
  filename: string;
  /** Content type of the file */
  contentType: string;
}

/**
 * Image variant configuration
 */
export interface ImageVariant {
  name: string;
  width: number;
  height?: number;
  quality?: number;
}

/**
 * Result of image processing
 */
export interface ProcessedImage {
  original: UploadResult;
  variants: Record<string, UploadResult>;
}

/**
 * Storage provider interface
 *
 * Implementations must provide all these methods.
 * This abstraction allows switching between local and cloud storage.
 */
export interface StorageProvider {
  /**
   * Upload a file to storage
   */
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult>;

  /**
   * Delete a file from storage
   */
  delete(path: string): Promise<void>;

  /**
   * Get a public URL for a stored file
   */
  getUrl(path: string): string;

  /**
   * Check if a file exists
   */
  exists(path: string): Promise<boolean>;
}

/**
 * Supported mime types for upload
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_PDF_TYPE = "application/pdf" as const;

export const ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ALLOWED_PDF_TYPE,
] as const;

export type AllowedMimeType = (typeof ALLOWED_TYPES)[number];

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB for images
  pdf: 25 * 1024 * 1024,   // 25MB for PDFs
} as const;

/**
 * Image resize variants
 */
export const IMAGE_VARIANTS: ImageVariant[] = [
  { name: "small", width: 400, quality: 80 },
  { name: "medium", width: 800, quality: 85 },
  { name: "large", width: 1200, quality: 90 },
];

/**
 * Check if a mime type is an image
 */
export function isImageType(mimeType: string): mimeType is (typeof ALLOWED_IMAGE_TYPES)[number] {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_TYPES)[number]);
}

/**
 * Check if a mime type is allowed
 */
export function isAllowedType(mimeType: string): mimeType is AllowedMimeType {
  return ALLOWED_TYPES.includes(mimeType as AllowedMimeType);
}

/**
 * Get file size limit for a mime type
 */
export function getFileSizeLimit(mimeType: string): number {
  if (isImageType(mimeType)) {
    return FILE_SIZE_LIMITS.image;
  }
  return FILE_SIZE_LIMITS.pdf;
}
