/**
 * Branding API Routes
 *
 * GET /api/branding - Get church branding settings
 * PUT /api/branding - Update church branding settings
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthContext, requireContentEditor, AuthError } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import type { ApiResponse } from "@/types";
import { z } from "zod";

// Validation schema for branding settings
const brandingSchema = z.object({
  // Logos
  logoHeaderUrl: z.string().url().optional().nullable().or(z.literal("")),
  logoLightUrl: z.string().url().optional().nullable().or(z.literal("")),
  logoDarkUrl: z.string().url().optional().nullable().or(z.literal("")),
  faviconUrl: z.string().url().optional().nullable().or(z.literal("")),

  // Colors
  colorPrimary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  colorSecondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  colorAccent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  colorBackground: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  colorText: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  colorPresets: z.array(z.object({
    name: z.string().min(1),
    value: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  })).optional(),

  // Gradients
  gradientPresets: z.array(z.object({
    name: z.string().min(1),
    value: z.string().min(1),
  })).optional(),

  // Typography
  fontPrimary: z.string().max(100).optional().nullable().or(z.literal("")),
  fontSecondary: z.string().max(100).optional().nullable().or(z.literal("")),
  fontSizeBase: z.number().int().min(12).max(24).optional().nullable(),
  headingScale: z.number().min(1).max(2).optional().nullable(),
  lineHeight: z.number().min(1).max(3).optional().nullable(),

  // Button styles
  buttonStyle: z.enum(["rounded", "pill", "square"]).optional().nullable(),
  buttonRadius: z.number().int().min(0).max(50).optional().nullable(),

  // Button colors
  buttonPrimaryBg: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  buttonPrimaryText: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  buttonSecondaryBg: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  buttonSecondaryText: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  buttonOutlineBorder: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  buttonOutlineText: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  buttonAccentBg: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  buttonAccentText: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),

  // Spacing
  spacingDensity: z.enum(["compact", "comfortable", "spacious"]).optional().nullable(),
  contentWidth: z.enum(["narrow", "normal", "wide"]).optional().nullable(),

  // Additional styles
  borderRadius: z.number().int().min(0).max(50).optional().nullable(),
  linkColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
  linkHoverColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("")),
});

function formatZodError(error: z.ZodError): string {
  return error.errors
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join(", ");
}

/**
 * GET /api/branding
 * Get church branding settings
 */
export async function GET() {
  try {
    const context = await requireAuthContext();

    let branding = await prisma.churchBranding.findUnique({
      where: { churchId: context.church.id },
    });

    // Create default branding if none exists
    if (!branding) {
      branding = await prisma.churchBranding.create({
        data: {
          churchId: context.church.id,
          colorPresets: [],
          gradientPresets: [],
        },
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { branding },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to get branding", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to load branding settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/branding
 * Update church branding settings
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireContentEditor();

    // Parse and validate body
    const body = await request.json();
    const parseResult = brandingSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: formatZodError(parseResult.error) },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Build update object with only provided fields
    // This allows partial updates without resetting other settings
    const updateData: Record<string, unknown> = {};

    // Helper to check if a key was explicitly provided in the request body
    const wasProvided = (key: string) => key in body;

    // Logos
    if (wasProvided("logoHeaderUrl")) updateData.logoHeaderUrl = data.logoHeaderUrl || null;
    if (wasProvided("logoLightUrl")) updateData.logoLightUrl = data.logoLightUrl || null;
    if (wasProvided("logoDarkUrl")) updateData.logoDarkUrl = data.logoDarkUrl || null;
    if (wasProvided("faviconUrl")) updateData.faviconUrl = data.faviconUrl || null;

    // Colors
    if (wasProvided("colorPrimary")) updateData.colorPrimary = data.colorPrimary || null;
    if (wasProvided("colorSecondary")) updateData.colorSecondary = data.colorSecondary || null;
    if (wasProvided("colorAccent")) updateData.colorAccent = data.colorAccent || null;
    if (wasProvided("colorBackground")) updateData.colorBackground = data.colorBackground || null;
    if (wasProvided("colorText")) updateData.colorText = data.colorText || null;
    if (wasProvided("colorPresets")) updateData.colorPresets = data.colorPresets ?? [];
    if (wasProvided("gradientPresets")) updateData.gradientPresets = data.gradientPresets ?? [];
    if (wasProvided("linkColor")) updateData.linkColor = data.linkColor || null;
    if (wasProvided("linkHoverColor")) updateData.linkHoverColor = data.linkHoverColor || null;

    // Typography
    if (wasProvided("fontPrimary")) updateData.fontPrimary = data.fontPrimary || null;
    if (wasProvided("fontSecondary")) updateData.fontSecondary = data.fontSecondary || null;
    if (wasProvided("fontSizeBase")) updateData.fontSizeBase = data.fontSizeBase ?? 16;
    if (wasProvided("headingScale")) updateData.headingScale = data.headingScale ?? 1.25;
    if (wasProvided("lineHeight")) updateData.lineHeight = data.lineHeight ?? 1.5;

    // Button styles
    if (wasProvided("buttonStyle")) updateData.buttonStyle = data.buttonStyle ?? "rounded";
    if (wasProvided("buttonRadius")) updateData.buttonRadius = data.buttonRadius ?? 6;
    if (wasProvided("borderRadius")) updateData.borderRadius = data.borderRadius ?? 8;

    // Spacing
    if (wasProvided("spacingDensity")) updateData.spacingDensity = data.spacingDensity ?? "comfortable";
    if (wasProvided("contentWidth")) updateData.contentWidth = data.contentWidth ?? "normal";

    // Button colors
    if (wasProvided("buttonPrimaryBg")) updateData.buttonPrimaryBg = data.buttonPrimaryBg || null;
    if (wasProvided("buttonPrimaryText")) updateData.buttonPrimaryText = data.buttonPrimaryText || null;
    if (wasProvided("buttonSecondaryBg")) updateData.buttonSecondaryBg = data.buttonSecondaryBg || null;
    if (wasProvided("buttonSecondaryText")) updateData.buttonSecondaryText = data.buttonSecondaryText || null;
    if (wasProvided("buttonOutlineBorder")) updateData.buttonOutlineBorder = data.buttonOutlineBorder || null;
    if (wasProvided("buttonOutlineText")) updateData.buttonOutlineText = data.buttonOutlineText || null;
    if (wasProvided("buttonAccentBg")) updateData.buttonAccentBg = data.buttonAccentBg || null;
    if (wasProvided("buttonAccentText")) updateData.buttonAccentText = data.buttonAccentText || null;

    // Upsert branding settings
    const branding = await prisma.churchBranding.upsert({
      where: { churchId: user.churchId },
      create: {
        churchId: user.churchId,
        colorPresets: [],
        gradientPresets: [],
        ...updateData,
      },
      update: updateData,
    });

    logger.info("Branding updated", { churchId: user.churchId });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { branding },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
      );
    }
    logger.error("Failed to update branding", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update branding settings" },
      { status: 500 }
    );
  }
}
