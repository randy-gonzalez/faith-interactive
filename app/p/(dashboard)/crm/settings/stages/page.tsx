/**
 * CRM Stage Settings Page
 *
 * PLATFORM_ADMIN only - Manage pipeline stages.
 */

import { requirePlatformAdmin } from "@/lib/crm/guards";
import { getAllStages } from "@/lib/crm/queries";
import Link from "next/link";
import { StageList } from "../../components/stage-list";
import { CreateStageForm } from "../../components/create-stage-form";

export default async function StagesSettingsPage() {
  await requirePlatformAdmin();
  const stages = await getAllStages();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/crm"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to CRM
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          Pipeline Stages
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the stages in your sales pipeline. Drag to reorder.
        </p>
      </div>

      {/* Create Form */}
      <CreateStageForm />

      {/* Stage List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-medium text-gray-900">Stages</h2>
        </div>
        <StageList stages={stages} />
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>
          <strong>Active stages</strong> appear in the pipeline and can be assigned to leads.
        </p>
        <p>
          <strong>Inactive stages</strong> are hidden from new lead assignment but existing leads keep their stage.
        </p>
        <p>
          You must have at least one active stage.
        </p>
      </div>
    </div>
  );
}
