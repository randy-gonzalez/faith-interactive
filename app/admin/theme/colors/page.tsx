/**
 * Colors Settings Page
 *
 * Configure brand colors, link colors, and color presets.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { canEditContent } from "@/lib/auth/permissions";
import { ColorsSettingsForm } from "@/components/dashboard/colors-settings-form";

export default async function ColorsSettingsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const canEdit = canEditContent(user.role);

  // Get current branding settings
  let branding = await prisma.churchBranding.findUnique({
    where: { churchId: church.id },
  });

  // Create default branding if none exists
  if (!branding) {
    branding = await prisma.churchBranding.create({
      data: {
        churchId: church.id,
        colorPresets: [],
        gradientPresets: [],
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Colors</h1>
        <p className="text-gray-500 mt-1">
          Customize your brand colors and color presets
        </p>
      </div>

      {/* Colors Form */}
      <ColorsSettingsForm branding={branding} canEdit={canEdit} />
    </div>
  );
}
