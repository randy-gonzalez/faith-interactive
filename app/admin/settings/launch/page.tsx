/**
 * Launch Checklist Page
 *
 * Admin-only page for tracking launch readiness.
 * Shows a checklist of tasks needed before launching the site.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { LaunchChecklist } from "@/components/dashboard/launch-checklist";
import { LAUNCH_CHECKLIST_ITEMS } from "@/app/api/launch-checklist/route";

export default async function LaunchPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;

  // Admin only
  if (user.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }

  // Get completed items from database
  const completedItems = await prisma.launchChecklistItem.findMany({
    where: { churchId: church.id },
  });

  // Map completion status to each predefined item
  const completedMap = new Map(
    completedItems.map((item) => [item.itemKey, item])
  );

  const items = LAUNCH_CHECKLIST_ITEMS.map((item) => {
    const completed = completedMap.get(item.key);
    return {
      key: item.key,
      label: item.label,
      description: item.description,
      category: item.category,
      isComplete: completed?.isComplete ?? false,
      completedAt: completed?.completedAt ?? null,
      notes: completed?.notes ?? null,
    };
  });

  // Calculate progress
  const completedCount = items.filter((i) => i.isComplete).length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  // Get site settings for maintenance mode
  const siteSettings = await prisma.siteSettings.findUnique({
    where: { churchId: church.id },
    select: { maintenanceMode: true },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Launch Checklist
        </h1>
        <p className="text-gray-500 mt-1">
          Complete these tasks before launching your website
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Launch Progress
          </span>
          <span className="text-sm font-medium text-gray-900">
            {completedCount} of {totalCount} complete ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              percentage === 100
                ? "bg-green-500"
                : percentage >= 70
                ? "bg-blue-500"
                : percentage >= 40
                ? "bg-yellow-500"
                : "bg-gray-400"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {percentage === 100 && (
          <p className="mt-3 text-sm text-green-600 font-medium">
            All tasks complete! Your site is ready to launch.
          </p>
        )}
      </div>

      {/* Maintenance Mode Status */}
      <div className={`border rounded-lg p-4 ${
        siteSettings?.maintenanceMode
          ? "bg-yellow-50 border-yellow-200"
          : "bg-green-50 border-green-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            siteSettings?.maintenanceMode
              ? "bg-yellow-500"
              : "bg-green-500"
          }`} />
          <div>
            <p className={`font-medium ${
              siteSettings?.maintenanceMode
                ? "text-yellow-900"
                : "text-green-900"
            }`}>
              {siteSettings?.maintenanceMode
                ? "Site is in Maintenance Mode"
                : "Site is Live"}
            </p>
            <p className={`text-sm ${
              siteSettings?.maintenanceMode
                ? "text-yellow-800"
                : "text-green-800"
            }`}>
              {siteSettings?.maintenanceMode
                ? "Visitors see a \"Coming Soon\" page. Toggle off in Site Settings when ready."
                : "Your site is visible to the public."}
            </p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <LaunchChecklist
        items={items}
        initialProgress={{ completed: completedCount, total: totalCount, percentage }}
      />
    </div>
  );
}
