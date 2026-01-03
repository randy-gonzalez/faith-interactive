/**
 * Prayer Requests Dashboard Page
 *
 * Lists all prayer requests for the church.
 * Allows marking as read/unread and archiving.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { redirect } from "next/navigation";
import { PrayerRequestsList } from "@/components/dashboard/prayer-requests-list";

export default async function PrayerRequestsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { church } = context;
  const db = getTenantPrisma(church.id);

  // Get counts for tabs
  const [unreadCount, allCount, archivedCount] = await Promise.all([
    db.prayerRequest.count({ where: { isRead: false, isArchived: false } }),
    db.prayerRequest.count({ where: { isArchived: false } }),
    db.prayerRequest.count({ where: { isArchived: true } }),
  ]);

  // Get initial prayer requests (unread first)
  const prayerRequests = await db.prayerRequest.findMany({
    where: { isArchived: false },
    orderBy: [
      { isRead: "asc" }, // Unread first
      { createdAt: "desc" },
    ],
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Prayer Requests
          </h1>
          <p className="text-gray-500 mt-1">
            Manage prayer requests from your congregation
          </p>
        </div>
      </div>

      <PrayerRequestsList
        initialRequests={prayerRequests}
        unreadCount={unreadCount}
        allCount={allCount}
        archivedCount={archivedCount}
      />
    </div>
  );
}
