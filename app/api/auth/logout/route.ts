/**
 * Logout API Route
 *
 * POST /api/auth/logout
 *
 * Invalidates the current session and clears the session cookie.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME, createClearSessionCookieHeader } from "@/lib/auth/cookies";
import { logger } from "@/lib/logging/logger";
import type { ApiResponse } from "@/types";

export async function POST() {
  try {
    // Get session token from cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      // Delete session from database
      await deleteSession(sessionToken);
    }

    logger.info("User logged out");

    // Return response with cleared cookie
    const response = NextResponse.json<ApiResponse>(
      { success: true },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", createClearSessionCookieHeader());

    return response;
  } catch (error) {
    logger.error("Logout error", error instanceof Error ? error : null);

    // Still clear the cookie even if there's an error
    const response = NextResponse.json<ApiResponse>(
      { success: true },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", createClearSessionCookieHeader());

    return response;
  }
}
