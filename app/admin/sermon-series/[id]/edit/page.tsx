/**
 * Edit Sermon Series Page
 *
 * Edit an existing sermon series.
 */

import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { SermonSeriesForm } from "@/components/dashboard/sermon-series-form";
import { StatusBadge } from "@/components/ui/status-badge";

interface EditSermonSeriesProps {
  params: Promise<{ id: string }>;
}

export default async function EditSermonSeriesPage({
  params,
}: EditSermonSeriesProps) {
  const { id } = await params;
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const series = await db.sermonSeries.findUnique({
    where: { id },
  });

  if (!series) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {canEdit ? "Edit Series" : "View Series"}
          </h1>
          <p className="text-gray-500 mt-1">
            {series.name}
          </p>
        </div>
        <StatusBadge status={series.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <SermonSeriesForm initialData={series} canEdit={canEdit} />
      </div>
    </div>
  );
}
