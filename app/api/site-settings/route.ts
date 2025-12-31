/**
 * Site Settings API Routes
 *
 * GET /api/site-settings - Get site settings
 * PUT /api/site-settings - Update site settings (Admin/Editor)
 */

import { NextResponse } from "next/server";
import { requireContentEditor, getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import { siteSettingsExtendedSchema, formatZodError } from "@/lib/validation/schemas";

/**
 * GET /api/site-settings
 * Returns site settings for the current church.
 * Creates default settings if none exist.
 */
export async function GET() {
  try {
    const context = await getAuthContext();

    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { church } = context;

    // Get or create settings
    let settings = await prisma.siteSettings.findUnique({
      where: { churchId: church.id },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.siteSettings.create({
        data: {
          churchId: church.id,
          headerNavigation: [],
          footerNavigation: [],
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    logger.error("Failed to get site settings", error as Error);
    return NextResponse.json(
      { error: "Failed to get site settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/site-settings
 * Update site settings. Requires Admin or Editor role.
 */
export async function PUT(request: Request) {
  try {
    const user = await requireContentEditor();

    const body = await request.json();
    const result = siteSettingsExtendedSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const data = result.data;

    // Clean up empty strings to null for URL fields
    const cleanData = {
      logoUrl: data.logoUrl || null,
      headerNavigation: data.headerNavigation || [],
      footerText: data.footerText || null,
      footerNavigation: data.footerNavigation || [],
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
      youtubeUrl: data.youtubeUrl || null,
      serviceTimes: data.serviceTimes || null,
      address: data.address || null,
      phone: data.phone || null,
      contactEmail: data.contactEmail || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      faviconUrl: data.faviconUrl || null,
      mapEmbedUrl: data.mapEmbedUrl || null,
      homePageId: data.homePageId || null,
      // Phase 3: Notification settings
      prayerNotifyEmails: data.prayerNotifyEmails || null,
      volunteerNotifyEmails: data.volunteerNotifyEmails || null,
      // Phase 4: Maintenance mode
      maintenanceMode: data.maintenanceMode ?? false,
    };

    // Upsert settings
    const settings = await prisma.siteSettings.upsert({
      where: { churchId: user.churchId },
      update: cleanData,
      create: {
        churchId: user.churchId,
        ...cleanData,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update site settings", error as Error);
    return NextResponse.json(
      { error: "Failed to update site settings" },
      { status: 500 }
    );
  }
}
