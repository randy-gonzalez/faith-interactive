/**
 * Church Switcher API Route
 *
 * POST /api/auth/switch-church
 *
 * Allows authenticated users to switch their active church context.
 * - Regular users can switch between churches they have memberships in
 * - Platform users can switch to ANY church
 *
 * All admin routes are on the main domain, so redirect is always to /admin/dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { switchActiveChurch } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";

const switchChurchSchema = z.object({
  churchId: z.string().min(1, "Church ID is required"),
});

interface SwitchChurchResponse {
  success: boolean;
  redirectUrl?: string;
  church?: {
    id: string;
    slug: string;
    name: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get session token
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json<SwitchChurchResponse>(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const parseResult = switchChurchSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<SwitchChurchResponse>(
        {
          success: false,
          error: parseResult.error.errors[0]?.message || "Invalid request",
        },
        { status: 400 }
      );
    }

    const { churchId } = parseResult.data;

    // Get church details
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { id: true, slug: true, name: true },
    });

    if (!church) {
      return NextResponse.json<SwitchChurchResponse>(
        { success: false, error: "Church not found" },
        { status: 404 }
      );
    }

    // Attempt to switch (this validates access)
    const success = await switchActiveChurch(sessionToken, churchId);

    if (!success) {
      return NextResponse.json<SwitchChurchResponse>(
        { success: false, error: "You don't have access to this organization" },
        { status: 403 }
      );
    }

    // Redirect to main domain admin (all admin is on main domain)
    const redirectUrl = "/admin/dashboard";

    logger.info("Church switched", { churchId, churchSlug: church.slug });

    return NextResponse.json<SwitchChurchResponse>({
      success: true,
      redirectUrl,
      church,
    });
  } catch (error) {
    logger.error("Switch church error", error instanceof Error ? error : null);
    return NextResponse.json<SwitchChurchResponse>(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/switch-church
 *
 * Returns list of churches the current user can switch to.
 * - For regular users: their memberships
 * - For platform users: all active churches
 */
export async function GET() {
  try {
    // Get session token
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate session and get user
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      select: {
        userId: true,
        activeChurchId: true,
        expiresAt: true,
        user: {
          select: {
            platformRole: true,
            memberships: {
              where: { isActive: true },
              select: {
                churchId: true,
                role: true,
                isPrimary: true,
                church: {
                  select: {
                    id: true,
                    slug: true,
                    name: true,
                  },
                },
              },
              orderBy: [{ isPrimary: "desc" }, { church: { name: "asc" } }],
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Session expired" },
        { status: 401 }
      );
    }

    const { user } = session;

    // For platform users, return all churches
    if (user.platformRole) {
      const allChurches = await prisma.church.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          slug: true,
          name: true,
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({
        success: true,
        isPlatformUser: true,
        activeChurchId: session.activeChurchId,
        churches: allChurches.map((church) => ({
          churchId: church.id,
          churchSlug: church.slug,
          churchName: church.name,
          role: "ADMIN", // Platform users get implicit ADMIN
          isMember: user.memberships.some((m) => m.churchId === church.id),
        })),
      });
    }

    // For regular users, return their memberships
    return NextResponse.json({
      success: true,
      isPlatformUser: false,
      activeChurchId: session.activeChurchId,
      churches: user.memberships.map((m) => ({
        churchId: m.churchId,
        churchSlug: m.church.slug,
        churchName: m.church.name,
        role: m.role,
        isPrimary: m.isPrimary,
      })),
    });
  } catch (error) {
    logger.error("Get churches error", error instanceof Error ? error : null);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
