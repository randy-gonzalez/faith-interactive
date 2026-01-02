/**
 * Admin Layout
 *
 * Shared layout for all admin/dashboard pages.
 * Includes navigation sidebar and header.
 * Requires authentication.
 */

import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { DashboardNav } from "@/components/dashboard/nav";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get authenticated user and church context
  const context = await getAuthContext();

  // Redirect to login if not authenticated
  if (!context) {
    redirect("/login");
  }

  const { user, church } = context;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar navigation */}
      <DashboardNav userRole={user.role} churchName={church.name} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader
          userName={user.name}
          userEmail={user.email}
          userRole={user.role}
          platformRole={user.platformRole}
          currentChurch={church}
        />

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
