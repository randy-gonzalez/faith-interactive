/**
 * Storage Module
 *
 * Provides a unified interface for file storage.
 * Automatically selects the appropriate provider based on environment.
 *
 * Usage:
 *   import { storage } from "@/lib/storage";
 *   const result = await storage.upload(buffer, options);
 */

import { StorageProvider } from "./types";
import { LocalStorageProvider } from "./local";
import { S3StorageProvider } from "./s3";

// Re-export types
export * from "./types";

/**
 * Storage provider type based on configuration
 */
type StorageType = "local" | "s3";

/**
 * Determine which storage provider to use
 */
function getStorageType(): StorageType {
  // Use S3 if bucket is configured, otherwise local
  if (process.env.S3_BUCKET) {
    return "s3";
  }
  return "local";
}

/**
 * Create the appropriate storage provider
 */
function createStorageProvider(): StorageProvider {
  const type = getStorageType();

  switch (type) {
    case "s3":
      return new S3StorageProvider();
    case "local":
    default:
      return new LocalStorageProvider();
  }
}

/**
 * Singleton storage instance
 *
 * Use this throughout the application for file operations.
 */
let _storage: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!_storage) {
    _storage = createStorageProvider();
  }
  return _storage;
}

/**
 * Convenience export for direct usage
 */
export const storage = {
  get provider() {
    return getStorage();
  },

  upload: (...args: Parameters<StorageProvider["upload"]>) =>
    getStorage().upload(...args),

  delete: (...args: Parameters<StorageProvider["delete"]>) =>
    getStorage().delete(...args),

  getUrl: (...args: Parameters<StorageProvider["getUrl"]>) =>
    getStorage().getUrl(...args),

  exists: (...args: Parameters<StorageProvider["exists"]>) =>
    getStorage().exists(...args),
};
