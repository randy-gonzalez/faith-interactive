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
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-gray-500 mt-1">
          {church.name} Dashboard
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <p className="text-2xl font-semibold text-gray-900">
              {stat.count}
            </p>
            <p className="text-sm text-gray-500">
              {stat.label}
            </p>
          </a>
        ))}
      </div>

      {/* Getting started section */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h2 className="text-lg font-medium text-blue-900 mb-2">
          Getting Started
        </h2>
        <p className="text-blue-700 text-sm">
          Use the navigation on the left to manage your church content.
          Create pages, add sermons, schedule events, and more.
        </p>
      </div>
    </div>
  );
}
