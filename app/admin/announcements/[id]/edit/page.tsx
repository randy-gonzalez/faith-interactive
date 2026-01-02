/**
 * Edit Announcement Page
 *
 * Edit an existing announcement.
 */

import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { AnnouncementForm } from "@/components/dashboard/announcement-form";
import { StatusBadge } from "@/components/ui/status-badge";

interface EditAnnouncementProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnnouncementPage({
  params,
}: EditAnnouncementProps) {
  const { id } = await params;
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const announcement = await db.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {canEdit ? "Edit Announcement" : "View Announcement"}
          </h1>
          <p className="text-gray-500 mt-1">
            {announcement.title}
          </p>
        </div>
        <StatusBadge status={announcement.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <AnnouncementForm initialData={announcement} canEdit={canEdit} />
      </div>
    </div>
  );
}
