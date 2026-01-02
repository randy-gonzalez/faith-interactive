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
  })).optional().default([]),

  // Gradients
  gradientPresets: z.array(z.object({
    name: z.string().min(1),
    value: z.string().min(1),
  })).optional().default([]),

  // Typography
  fontPrimary: z.string().max(100).optional().nullable().or(z.literal("")),
  fontSecondary: z.string().max(100).optional().nullable().or(z.literal("")),
  fontSizeBase: z.number().int().min(12).max(24).optional().nullable(),
  headingScale: z.number().min(1).max(2).optional().nullable(),
  lineHeight: z.number().min(1).max(3).optional().nullable(),

  // Button styles
  buttonStyle: z.enum(["rounded", "pill", "square"]).optional().nullable(),
  buttonRadius: z.number().int().min(0).max(50).optional().nullable(),

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

    // Upsert branding settings
    const branding = await prisma.churchBranding.upsert({
      where: { churchId: user.churchId },
      create: {
        churchId: user.churchId,
        logoHeaderUrl: data.logoHeaderUrl || null,
        logoLightUrl: data.logoLightUrl || null,
        logoDarkUrl: data.logoDarkUrl || null,
        faviconUrl: data.faviconUrl || null,
        colorPrimary: data.colorPrimary || null,
        colorSecondary: data.colorSecondary || null,
        colorAccent: data.colorAccent || null,
        colorBackground: data.colorBackground || null,
        colorText: data.colorText || null,
        colorPresets: data.colorPresets,
        gradientPresets: data.gradientPresets,
        fontPrimary: data.fontPrimary || null,
        fontSecondary: data.fontSecondary || null,
        fontSizeBase: data.fontSizeBase ?? 16,
        headingScale: data.headingScale ?? 1.25,
        lineHeight: data.lineHeight ?? 1.5,
        buttonStyle: data.buttonStyle ?? "rounded",
        buttonRadius: data.buttonRadius ?? 6,
        borderRadius: data.borderRadius ?? 8,
        linkColor: data.linkColor || null,
        linkHoverColor: data.linkHoverColor || null,
      },
      update: {
        logoHeaderUrl: data.logoHeaderUrl || null,
        logoLightUrl: data.logoLightUrl || null,
        logoDarkUrl: data.logoDarkUrl || null,
        faviconUrl: data.faviconUrl || null,
        colorPrimary: data.colorPrimary || null,
        colorSecondary: data.colorSecondary || null,
        colorAccent: data.colorAccent || null,
        colorBackground: data.colorBackground || null,
        colorText: data.colorText || null,
        colorPresets: data.colorPresets,
        gradientPresets: data.gradientPresets,
        fontPrimary: data.fontPrimary || null,
        fontSecondary: data.fontSecondary || null,
        fontSizeBase: data.fontSizeBase ?? 16,
        headingScale: data.headingScale ?? 1.25,
        lineHeight: data.lineHeight ?? 1.5,
        buttonStyle: data.buttonStyle ?? "rounded",
        buttonRadius: data.buttonRadius ?? 6,
        borderRadius: data.borderRadius ?? 8,
        linkColor: data.linkColor || null,
        linkHoverColor: data.linkHoverColor || null,
      },
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
