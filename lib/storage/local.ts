/**
 * Local Filesystem Storage Provider
 *
 * Stores files on the local filesystem for development.
 * Files are stored in /public/uploads and served directly by Next.js.
 */

import { mkdir, writeFile, unlink, access } from "fs/promises";
import path from "path";
import { StorageProvider, UploadOptions, UploadResult } from "./types";

/**
 * Local filesystem storage implementation
 */
export class LocalStorageProvider implements StorageProvider {
  private basePath: string;
  private baseUrl: string;

  constructor() {
    // Store in public/uploads for Next.js static serving
    this.basePath = path.join(process.cwd(), "public", "uploads");
    this.baseUrl = "/uploads";
  }

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const { folder, filename, contentType: _contentType } = options;

    // Build the full path
    const relativePath = path.join(folder, filename);
    const fullPath = path.join(this.basePath, relativePath);
    const dirPath = path.dirname(fullPath);

    // Ensure directory exists
    await mkdir(dirPath, { recursive: true });

    // Write the file
    await writeFile(fullPath, buffer);

    // Return the relative path and URL
    const storagePath = relativePath.replace(/\\/g, "/"); // Normalize for cross-platform
    return {
      path: storagePath,
      url: this.getUrl(storagePath),
    };
  }

  async delete(storagePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, storagePath);
    try {
      await unlink(fullPath);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  getUrl(storagePath: string): string {
    // Normalize path separators for URL
    const normalizedPath = storagePath.replace(/\\/g, "/");
    return `${this.baseUrl}/${normalizedPath}`;
  }

  async exists(storagePath: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, storagePath);
    try {
      await access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
