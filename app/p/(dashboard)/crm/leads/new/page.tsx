/**
 * Create Lead Page
 *
 * Form to create a new CRM lead.
 */

import { requireCrmUser, isPlatformAdmin } from "@/lib/crm/guards";
import { getActiveStages, getDefaultStage, getCrmUsers } from "@/lib/crm/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LeadForm } from "../../components/lead-form";

export default async function NewLeadPage() {
  const user = await requireCrmUser();

  const [stages, defaultStage, crmUsers] = await Promise.all([
    getActiveStages(),
    getDefaultStage(),
    isPlatformAdmin(user) ? getCrmUsers() : Promise.resolve([]),
  ]);

  if (!defaultStage) {
    // No stages exist - this shouldn't happen if seedDefaultStages ran
    redirect("/crm/settings/stages");
  }

  const canAssignOwner = isPlatformAdmin(user);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/crm/leads"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Leads
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">New Lead</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <LeadForm
          stages={stages}
          defaultStageId={defaultStage.id}
          currentUserId={user.id}
          crmUsers={canAssignOwner ? crmUsers : undefined}
        />
      </div>
    </div>
  );
}
