/**
 * Edit Sermon Page
 *
 * Edit an existing sermon.
 */

import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { SermonForm } from "@/components/dashboard/sermon-form";
import { StatusBadge } from "@/components/ui/status-badge";

interface EditSermonProps {
  params: Promise<{ id: string }>;
}

export default async function EditSermonPage({ params }: EditSermonProps) {
  const { id } = await params;
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const sermon = await db.sermon.findUnique({
    where: { id },
    include: {
      speaker: true,
      series: true,
      topics: {
        include: {
          topic: true,
        },
      },
      scriptureReferences: {
        include: {
          book: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!sermon) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {canEdit ? "Edit Sermon" : "View Sermon"}
          </h1>
          <p className="text-gray-500 mt-1">
            {sermon.title}
          </p>
        </div>
        <StatusBadge status={sermon.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <SermonForm initialData={sermon} canEdit={canEdit} />
      </div>
    </div>
  );
}
