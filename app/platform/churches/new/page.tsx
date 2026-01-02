/**
 * Create Church Page
 *
 * Form to create a new church tenant.
 * Platform admin only.
 */

import { requirePlatformAdminOrRedirect } from "@/lib/auth/guards";
import { ChurchForm } from "@/components/platform/church-form";

export default async function CreateChurchPage() {
  await requirePlatformAdminOrRedirect();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Church</h1>
        <p className="text-gray-600">
          Create a new church tenant on the platform.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ChurchForm />
      </div>
    </div>
  );
}
