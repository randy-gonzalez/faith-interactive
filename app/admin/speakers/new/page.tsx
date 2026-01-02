/**
 * New Speaker Page
 *
 * Create a new speaker.
 */

import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/guards";
import { canEditContent } from "@/lib/auth/permissions";
import { SpeakerForm } from "@/components/dashboard/speaker-form";

export default async function NewSpeakerPage() {
  const context = await requireAuthContext();
  const canEdit = canEditContent(context.user.role);

  if (!canEdit) {
    redirect("/admin/speakers");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Add Speaker
        </h1>
        <p className="text-gray-500 mt-1">
          Create a new speaker profile
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <SpeakerForm canEdit={canEdit} />
      </div>
    </div>
  );
}
