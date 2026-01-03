/**
 * Typography Settings Page
 *
 * Configure fonts, font sizes, and typography scale.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { canEditContent } from "@/lib/auth/permissions";
import { TypographySettingsForm } from "@/components/dashboard/typography-settings-form";

export default async function TypographySettingsPage() {
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
        <h1 className="text-2xl font-semibold text-gray-900">Typography</h1>
        <p className="text-gray-500 mt-1">
          Choose fonts and customize typography settings
        </p>
      </div>

      {/* Typography Form */}
      <TypographySettingsForm branding={branding} canEdit={canEdit} />
    </div>
  );
}
