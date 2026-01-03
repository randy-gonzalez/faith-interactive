/**
 * Footer Settings Page
 *
 * Configure footer layout, sections visibility, styling, and navigation.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { canEditContent } from "@/lib/auth/permissions";
import { FooterSettingsForm } from "@/components/dashboard/footer-settings-form";
import { DEFAULT_FOOTER_CONFIG } from "@/types/template";

export default async function FooterSettingsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const canEdit = canEditContent(user.role);

  // Get current site settings (footer fields)
  const settings = await prisma.siteSettings.findUnique({
    where: { churchId: church.id },
    select: {
      footerTemplate: true,
      footerConfig: true,
      footerNavigation: true,
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

  // Prepare footer data with defaults
  const footerData = {
    footerTemplate: settings?.footerTemplate || "4-column",
    footerConfig: settings?.footerConfig
      ? { ...DEFAULT_FOOTER_CONFIG, ...(settings.footerConfig as object) }
      : DEFAULT_FOOTER_CONFIG,
    footerNavigation: (settings?.footerNavigation as unknown[]) || [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Footer</h1>
        <p className="text-gray-500 mt-1">
          Customize your footer layout, sections, and navigation links
        </p>
      </div>

      {/* Footer Settings Form */}
      <FooterSettingsForm
        settings={footerData}
        pages={pages}
        canEdit={canEdit}
      />
    </div>
  );
}
