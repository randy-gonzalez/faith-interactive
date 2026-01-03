/**
 * Media Library Dashboard Page
 *
 * Upload and manage media files (images and PDFs).
 */

import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { redirect } from "next/navigation";
import { MediaLibrary } from "@/components/dashboard/media-library";
import { storage } from "@/lib/storage";
import type { ImageVariants, MediaMetadata } from "@/types/media";

export default async function MediaPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { church } = context;
  const db = getTenantPrisma(church.id);

  // Get initial media items
  const media = await db.media.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Add URLs to media items
  const mediaWithUrls = media.map((item) => {
    const metadata = item.variants as MediaMetadata | null;
    const variants = metadata?.variants as ImageVariants | undefined;

    // Build variant URLs from the new structure
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

  const totalCount = await db.media.count({ where: { deletedAt: null } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Media Library
          </h1>
          <p className="text-gray-500 mt-1">
            Upload and manage images and documents
          </p>
        </div>
      </div>

      <MediaLibrary initialMedia={mediaWithUrls} totalCount={totalCount} />
    </div>
  );
}
