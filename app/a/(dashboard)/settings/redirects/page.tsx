/**
 * Redirect Rules Management Page
 *
 * Admin-only page for managing URL redirects.
 * Allows adding, editing, and removing redirect rules.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { redirect } from "next/navigation";
import { RedirectsManager } from "@/components/dashboard/redirects-manager";

export default async function RedirectsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;

  // Admin only
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const db = getTenantPrisma(church.id);

  // Get existing redirects
  const redirects = await db.redirectRule.findMany({
    orderBy: { sourcePath: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          URL Redirects
        </h1>
        <p className="text-gray-500 mt-1">
          Manage 301 permanent redirects for your website
        </p>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-blue-900 mb-1">
          About Redirects
        </h2>
        <p className="text-sm text-blue-800">
          Redirects automatically send visitors from an old URL to a new one.
          All redirects are permanent (301), which tells search engines the page has moved.
          Redirects only apply to public pages, not admin or API routes.
        </p>
      </div>

      {/* Redirects Manager */}
      <RedirectsManager initialRedirects={redirects} />
    </div>
  );
}
