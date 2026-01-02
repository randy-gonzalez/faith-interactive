/**
 * Marketing Site Settings Page
 *
 * Configure global settings for the Faith Interactive marketing website.
 * Includes site name, navigation, footer, SEO defaults, and home page selection.
 */

import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdminOrRedirect } from "@/lib/auth/guards";
import { MarketingSettingsForm } from "./settings-form";

async function getOrCreateSettings() {
  // Get or create the singleton settings record
  let settings = await prisma.marketingSiteSettings.findFirst();

  if (!settings) {
    settings = await prisma.marketingSiteSettings.create({
      data: {
        siteName: "Faith Interactive",
        homePageSlug: "home",
        headerNavigation: [],
        footerLinks: [],
      },
    });
  }

  return settings;
}

export default async function MarketingSettingsPage() {
  // Only platform admins can access settings
  await requirePlatformAdminOrRedirect();

  const settings = await getOrCreateSettings();

  // Get all published pages for home page selection
  const pages = await prisma.marketingPage.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing Site Settings</h1>
        <p className="text-gray-600">
          Configure the Faith Interactive marketing website.
        </p>
      </div>

      {/* Settings form */}
      <MarketingSettingsForm settings={settings} pages={pages} />
    </div>
  );
}
