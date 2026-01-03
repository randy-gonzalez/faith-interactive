/**
 * Platform Dashboard Layout (Protected)
 *
 * Layout for protected platform pages with full dashboard chrome.
 * Requires platform role authentication - redirects to admin login if not authenticated.
 *
 * This layout provides:
 * - Platform role authentication check
 * - Sidebar navigation
 * - Header with user info
 */

import { requirePlatformUserOrRedirect } from "@/lib/auth/guards";
import { PlatformNav } from "@/components/platform/nav";
import { PlatformHeader } from "@/components/platform/header";

export default async function PlatformDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get platform user - redirects to login if not authenticated or not a platform user
  const user = await requirePlatformUserOrRedirect();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar navigation */}
      <PlatformNav platformRole={user.platformRole} userName={user.name} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with staff admin banner */}
        <PlatformHeader
          userName={user.name}
          userEmail={user.email}
          platformRole={user.platformRole}
          hasChurchAccess={true}
        />

        {/* Page content */}
        <main className="flex-1 p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
