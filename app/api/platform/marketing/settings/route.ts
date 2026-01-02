/**
 * Marketing Site Settings API
 *
 * PUT /api/platform/marketing/settings
 *
 * Update global marketing site settings.
 * Requires PLATFORM_ADMIN role.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformAdmin } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";

const navItemSchema = z.object({
  label: z.string(),
  url: z.string(),
  order: z.number(),
});

const settingsSchema = z.object({
  siteName: z.string().min(1),
  defaultMetaTitle: z.string().nullable(),
  defaultMetaDescription: z.string().nullable(),
  faviconUrl: z.string().url().nullable().or(z.literal("")),
  homePageSlug: z.string().min(1),
  footerText: z.string().nullable(),
  headerNavigation: z.array(navItemSchema),
  footerLinks: z.array(navItemSchema),
});

export async function PUT(request: NextRequest) {
  try {
    // Require platform admin
    const user = await requirePlatformAdmin();

    // Parse and validate body
    const body = await request.json();
    const parseResult = settingsSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid settings data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Get or create settings
    let settings = await prisma.marketingSiteSettings.findFirst();

    if (settings) {
      // Update existing
      settings = await prisma.marketingSiteSettings.update({
        where: { id: settings.id },
        data: {
          siteName: data.siteName,
          defaultMetaTitle: data.defaultMetaTitle,
          defaultMetaDescription: data.defaultMetaDescription,
          faviconUrl: data.faviconUrl || null,
          homePageSlug: data.homePageSlug,
          footerText: data.footerText,
          headerNavigation: data.headerNavigation,
          footerLinks: data.footerLinks,
        },
      });
    } else {
      // Create new
      settings = await prisma.marketingSiteSettings.create({
        data: {
          siteName: data.siteName,
          defaultMetaTitle: data.defaultMetaTitle,
          defaultMetaDescription: data.defaultMetaDescription,
          faviconUrl: data.faviconUrl || null,
          homePageSlug: data.homePageSlug,
          footerText: data.footerText,
          headerNavigation: data.headerNavigation,
          footerLinks: data.footerLinks,
        },
      });
    }

    logger.info("Marketing site settings updated", {
      userId: user.id,
      settingsId: settings.id,
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    logger.error("Failed to update marketing settings", error instanceof Error ? error : null);

    if (error instanceof Error && error.message.includes("access required")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Require platform user (read access)
    await requirePlatformAdmin();

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

    return NextResponse.json({ settings });
  } catch (error) {
    logger.error("Failed to get marketing settings", error instanceof Error ? error : null);

    if (error instanceof Error && error.message.includes("access required")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}
