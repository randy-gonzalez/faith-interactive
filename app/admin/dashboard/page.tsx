/**
 * Dashboard Home Page
 *
 * Overview page showing quick stats and recent activity.
 * This is intentionally minimal for Phase 1.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);

  // Get quick counts
  const [pageCount, sermonCount, eventCount, announcementCount, leadershipCount] =
    await Promise.all([
      db.page.count(),
      db.sermon.count(),
      db.event.count(),
      db.announcement.count(),
      db.leadershipProfile.count(),
    ]);

  const stats = [
    { label: "Pages", count: pageCount, href: "/pages" },
    { label: "Sermons", count: sermonCount, href: "/sermons" },
    { label: "Events", count: eventCount, href: "/events" },
    { label: "Announcements", count: announcementCount, href: "/announcements" },
    { label: "Leadership", count: leadershipCount, href: "/leadership" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Welcome back{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {church.name} Dashboard
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stat.count}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </a>
        ))}
      </div>

      {/* Getting started section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
        <h2 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          Getting Started
        </h2>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Use the navigation on the left to manage your church content.
          Create pages, add sermons, schedule events, and more.
        </p>
      </div>
    </div>
  );
}
