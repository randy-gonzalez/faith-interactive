/**
 * Create Marketing Page
 *
 * Form to create a new marketing page.
 */

import { requirePlatformAdminOrRedirect } from "@/lib/auth/guards";
import { MarketingPageEditor } from "@/components/platform/marketing-page-editor";

export default async function CreateMarketingPagePage() {
  await requirePlatformAdminOrRedirect();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Marketing Page</h1>
        <p className="text-gray-600">
          Create a new page for the Faith Interactive marketing website.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MarketingPageEditor />
      </div>
    </div>
  );
}
