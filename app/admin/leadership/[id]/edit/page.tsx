/**
 * Edit Leadership Profile Page
 *
 * Edit an existing leadership profile.
 */

import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { LeadershipForm } from "@/components/dashboard/leadership-form";
import { StatusBadge } from "@/components/ui/status-badge";

interface EditLeadershipProps {
  params: Promise<{ id: string }>;
}

export default async function EditLeadershipPage({
  params,
}: EditLeadershipProps) {
  const { id } = await params;
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const profile = await db.leadershipProfile.findUnique({
    where: { id },
  });

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {canEdit ? "Edit Profile" : "View Profile"}
          </h1>
          <p className="text-gray-500 mt-1">
            {profile.name}
          </p>
        </div>
        <StatusBadge status={profile.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <LeadershipForm initialData={profile} canEdit={canEdit} />
      </div>
    </div>
  );
}
