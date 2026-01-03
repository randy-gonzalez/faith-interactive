/**
 * Header Settings Page
 *
 * Configure header layout, navigation, mobile menu, and CTA button.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { canEditContent } from "@/lib/auth/permissions";
import { HeaderSettingsForm } from "@/components/dashboard/header-settings-form";
import { DEFAULT_HEADER_CONFIG } from "@/types/template";

export default async function HeaderSettingsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const canEdit = canEditContent(user.role);

  // Get current site settings (header fields)
  const settings = await prisma.siteSettings.findUnique({
    where: { churchId: church.id },
    select: {
      headerTemplate: true,
      headerConfig: true,
      headerNavigation: true,
    },
  });

  // Get all published pages for navigation link options
  const pages = await prisma.page.findMany({
    where: {
      churchId: church.id,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      urlPath: true,
    },
    orderBy: { title: "asc" },
  });

  // Prepare header data with defaults
  const headerData = {
    headerTemplate: settings?.headerTemplate || "classic",
    headerConfig: settings?.headerConfig
      ? { ...DEFAULT_HEADER_CONFIG, ...(settings.headerConfig as object) }
      : DEFAULT_HEADER_CONFIG,
    headerNavigation: (settings?.headerNavigation as unknown[]) || [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Header</h1>
        <p className="text-gray-500 mt-1">
          Customize your header layout, navigation, and mobile menu
        </p>
      </div>

      {/* Header Settings Form */}
      <HeaderSettingsForm
        settings={headerData}
        pages={pages}
        canEdit={canEdit}
      />
    </div>
  );
}
