/**
 * S3-Compatible Storage Provider
 *
 * Works with AWS S3, Cloudflare R2, MinIO, and other S3-compatible services.
 * Requires environment variables to be configured.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { StorageProvider, UploadOptions, UploadResult } from "./types";

/**
 * S3 configuration from environment variables
 */
function getS3Config() {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION || "auto";
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const publicUrl = process.env.S3_PUBLIC_URL;

  if (!bucket) {
    throw new Error("S3_BUCKET environment variable is required");
  }
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required");
  }

  return {
    bucket,
    region,
    endpoint,
    accessKeyId,
    secretAccessKey,
    publicUrl,
  };
}

/**
 * S3-compatible storage implementation
 */
export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string | undefined;

  constructor() {
    const config = getS3Config();

    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;

    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      // For R2 and other S3-compatible services
      forcePathStyle: !!config.endpoint,
    });
  }

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const { folder, filename, contentType } = options;

    // Build the S3 key (path)
    const key = `${folder}/${filename}`;

    // Upload to S3
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        // Set cache control for better CDN performance
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    return {
      path: key,
      url: this.getUrl(key),
    };
  }

  async delete(storagePath: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: storagePath,
        })
      );
    } catch (error) {
      // Log but don't throw - file may already be deleted
      console.error("S3 delete error:", error);
    }
  }

  getUrl(storagePath: string): string {
    if (this.publicUrl) {
      // Use configured public URL (e.g., CDN URL)
      return `${this.publicUrl}/${storagePath}`;
    }
    // Fallback to direct S3 URL (not recommended for production)
    return `https://${this.bucket}.s3.amazonaws.com/${storagePath}`;
  }

  async exists(storagePath: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: storagePath,
        })
      );
      return true;
    } catch {
      return false;
    }
  }
}
