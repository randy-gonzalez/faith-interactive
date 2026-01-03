/**
 * Admin Dashboard Layout (Protected)
 *
 * Layout for protected admin pages with full dashboard chrome.
 * Requires authentication - redirects to /login if not authenticated.
 *
 * This layout provides:
 * - Authentication check
 * - Church context from user's session
 * - Sidebar navigation
 * - Header with user info
 * - Branding context
 */

import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { DashboardNav } from "@/components/dashboard/nav";
import { DashboardHeader } from "@/components/dashboard/header";
import { BrandingProvider } from "@/contexts/branding-context";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get authenticated user and church context
  // For admin surface, church is resolved from user's session (activeChurchId)
  const context = await getAuthContext();

  // Redirect to login if not authenticated
  if (!context) {
    redirect("/login");
  }

  const { user, church } = context;

  return (
    <BrandingProvider>
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
    </BrandingProvider>
  );
}
