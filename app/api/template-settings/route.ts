/**
 * Template Settings API Routes
 *
 * GET /api/template-settings - Get template settings (header/footer layout config)
 * PUT /api/template-settings - Update template settings (Admin/Editor)
 */

import { NextResponse } from "next/server";
import { requireContentEditor, getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import { templateSettingsSchema, formatZodError } from "@/lib/validation/schemas";
import { DEFAULT_HEADER_CONFIG, DEFAULT_FOOTER_CONFIG } from "@/types/template";

/**
 * GET /api/template-settings
 * Returns template settings for the current church.
 */
export async function GET() {
  try {
    const context = await getAuthContext();

    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { church } = context;

    // Get site settings (template fields are stored there)
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

    // Return defaults if no settings exist
    if (!settings) {
      return NextResponse.json({
        settings: {
          headerTemplate: "classic",
          headerConfig: DEFAULT_HEADER_CONFIG,
          footerTemplate: "4-column",
          footerConfig: DEFAULT_FOOTER_CONFIG,
          headerNavigation: [],
          footerNavigation: [],
        },
      });
    }

    // Merge with defaults for any missing config values
    return NextResponse.json({
      settings: {
        headerTemplate: settings.headerTemplate || "classic",
        headerConfig: settings.headerConfig
          ? { ...DEFAULT_HEADER_CONFIG, ...(settings.headerConfig as object) }
          : DEFAULT_HEADER_CONFIG,
        footerTemplate: settings.footerTemplate || "4-column",
        footerConfig: settings.footerConfig
          ? { ...DEFAULT_FOOTER_CONFIG, ...(settings.footerConfig as object) }
          : DEFAULT_FOOTER_CONFIG,
        headerNavigation: settings.headerNavigation || [],
        footerNavigation: settings.footerNavigation || [],
      },
    });
  } catch (error) {
    logger.error("Failed to get template settings", error as Error);
    return NextResponse.json(
      { error: "Failed to get template settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/template-settings
 * Update template settings. Requires Admin or Editor role.
 */
export async function PUT(request: Request) {
  try {
    const user = await requireContentEditor();

    const body = await request.json();
    const result = templateSettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const data = result.data;

    // Prepare update data
    const updateData = {
      headerTemplate: data.headerTemplate || "classic",
      headerConfig: data.headerConfig || DEFAULT_HEADER_CONFIG,
      footerTemplate: data.footerTemplate || "4-column",
      footerConfig: data.footerConfig || DEFAULT_FOOTER_CONFIG,
      headerNavigation: data.headerNavigation || [],
      footerNavigation: data.footerNavigation || [],
    };

    // Upsert settings
    const settings = await prisma.siteSettings.upsert({
      where: { churchId: user.churchId },
      update: updateData,
      create: {
        churchId: user.churchId,
        ...updateData,
      },
      select: {
        headerTemplate: true,
        headerConfig: true,
        footerTemplate: true,
        footerConfig: true,
        headerNavigation: true,
        footerNavigation: true,
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
    logger.error("Failed to update template settings", error as Error);
    return NextResponse.json(
      { error: "Failed to update template settings" },
      { status: 500 }
    );
  }
}
