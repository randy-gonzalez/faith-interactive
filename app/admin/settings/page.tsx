/**
 * Site Settings Page
 *
 * Configure website header, footer, service info, SEO, and more.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { redirect } from "next/navigation";
import { canEditContent } from "@/lib/auth/permissions";
import { SiteSettingsForm } from "@/components/dashboard/site-settings-form";

export default async function SiteSettingsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  // Get current settings
  let settings = await prisma.siteSettings.findUnique({
    where: { churchId: church.id },
  });

  // Create default settings if none exist
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        churchId: church.id,
        headerNavigation: [],
        footerNavigation: [],
      },
    });
  }

  // Get all published pages for navigation selection
  const pages = await db.page.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      urlPath: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Site Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Configure your website appearance and information
        </p>
      </div>

      {/* Settings Form */}
      <SiteSettingsForm
        settings={settings}
        pages={pages}
        churchName={church.name}
        canEdit={canEdit}
      />
    </div>
  );
}
