/**
 * Volunteer Signups Dashboard Page
 *
 * Lists all volunteer signups for the church.
 * Allows marking as read/unread and archiving.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { redirect } from "next/navigation";
import { VolunteerSignupsList } from "@/components/dashboard/volunteer-signups-list";

export default async function VolunteerSignupsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { church } = context;
  const db = getTenantPrisma(church.id);

  // Get counts for tabs
  const [unreadCount, allCount, archivedCount] = await Promise.all([
    db.volunteerSignup.count({ where: { isRead: false, isArchived: false } }),
    db.volunteerSignup.count({ where: { isArchived: false } }),
    db.volunteerSignup.count({ where: { isArchived: true } }),
  ]);

  // Get initial volunteer signups (unread first)
  const volunteerSignups = await db.volunteerSignup.findMany({
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
            Volunteer Signups
          </h1>
          <p className="text-gray-500 mt-1">
            Manage volunteer interest signups
          </p>
        </div>
      </div>

      <VolunteerSignupsList
        initialSignups={volunteerSignups}
        unreadCount={unreadCount}
        allCount={allCount}
        archivedCount={archivedCount}
      />
    </div>
  );
}
