/**
 * Current User API Route
 *
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's information.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserFromSession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { logger } from "@/lib/logging/logger";
import type { ApiResponse, SafeUser } from "@/types";

export async function GET() {
  try {
    // Get session token from cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user from session
    const user = await getUserFromSession(sessionToken);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Session expired or invalid" },
        { status: 401 }
      );
    }

    // Return user without sensitive data
    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      platformRole: user.platformRole,
    };

    return NextResponse.json<ApiResponse<{ user: SafeUser }>>(
      { success: true, data: { user: safeUser } },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Get current user error", error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
