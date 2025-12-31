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
  const mediaWithUrls = media.map((item) => ({
    ...item,
    url: storage.getUrl(item.storagePath),
    variantUrls: item.variants
      ? Object.fromEntries(
          Object.entries(item.variants as Record<string, { path: string }>).map(
            ([name, variant]) => [name, storage.getUrl(variant.path)]
          )
        )
      : null,
  }));

  const totalCount = await db.media.count({ where: { deletedAt: null } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Media Library
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Upload and manage images and documents
          </p>
        </div>
      </div>

      <MediaLibrary initialMedia={mediaWithUrls} totalCount={totalCount} />
    </div>
  );
}
