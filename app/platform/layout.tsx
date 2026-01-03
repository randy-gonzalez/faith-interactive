/**
 * Platform Layout
 *
 * Shared layout for all /platform pages.
 * Requires platform role (PLATFORM_ADMIN or PLATFORM_STAFF).
 *
 * This layout is completely separate from the church /admin layout.
 */

import { requirePlatformUserOrRedirect } from "@/lib/auth/guards";
import { PlatformNav } from "@/components/platform/nav";
import { PlatformHeader } from "@/components/platform/header";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get platform user - redirects if not authenticated or not a platform user
  const user = await requirePlatformUserOrRedirect();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar navigation */}
      <PlatformNav
        platformRole={user.platformRole}
        userName={user.name}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with staff admin banner */}
        <PlatformHeader
          userName={user.name}
          userEmail={user.email}
          platformRole={user.platformRole}
          hasChurchAccess={true} // User has a church since they authenticated through one
        />

        {/* Page content */}
        <main className="flex-1 p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
