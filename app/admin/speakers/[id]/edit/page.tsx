/**
 * Edit Speaker Page
 *
 * Edit an existing speaker.
 */

import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { SpeakerForm } from "@/components/dashboard/speaker-form";
import { StatusBadge } from "@/components/ui/status-badge";

interface EditSpeakerProps {
  params: Promise<{ id: string }>;
}

export default async function EditSpeakerPage({
  params,
}: EditSpeakerProps) {
  const { id } = await params;
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const speaker = await db.speaker.findUnique({
    where: { id },
  });

  if (!speaker) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {canEdit ? "Edit Speaker" : "View Speaker"}
          </h1>
          <p className="text-gray-500 mt-1">
            {speaker.name}
          </p>
        </div>
        <StatusBadge status={speaker.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <SpeakerForm initialData={speaker} canEdit={canEdit} />
      </div>
    </div>
  );
}
