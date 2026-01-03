/**
 * Template Settings Page
 *
 * Configure header and footer templates, layouts, and navigation.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { canEditContent } from "@/lib/auth/permissions";
import { TemplateSettingsForm } from "@/components/dashboard/template-settings-form";
import { DEFAULT_HEADER_CONFIG, DEFAULT_FOOTER_CONFIG } from "@/types/template";

export default async function TemplateSettingsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const canEdit = canEditContent(user.role);

  // Get current site settings (template fields)
  const settings = await prisma.siteSettings.findUnique({
    where: { churchId: church.id },
    select: {
      headerTemplate: true,
      headerConfig: true,
      footerTemplate: true,
      footerConfig: true,
      headerNavigation: true,
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

  // Prepare template data with defaults
  const templateData = {
    headerTemplate: settings?.headerTemplate || "classic",
    headerConfig: settings?.headerConfig
      ? { ...DEFAULT_HEADER_CONFIG, ...(settings.headerConfig as object) }
      : DEFAULT_HEADER_CONFIG,
    footerTemplate: settings?.footerTemplate || "4-column",
    footerConfig: settings?.footerConfig
      ? { ...DEFAULT_FOOTER_CONFIG, ...(settings.footerConfig as object) }
      : DEFAULT_FOOTER_CONFIG,
    headerNavigation: (settings?.headerNavigation as unknown[]) || [],
    footerNavigation: (settings?.footerNavigation as unknown[]) || [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Template</h1>
        <p className="text-gray-500 mt-1">
          Customize your header and footer layout and design
        </p>
      </div>

      {/* Template Settings Form */}
      <TemplateSettingsForm
        settings={templateData}
        pages={pages}
        canEdit={canEdit}
      />
    </div>
  );
}
