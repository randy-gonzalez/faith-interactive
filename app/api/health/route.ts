/**
 * Health Check API Route
 *
 * GET /api/health
 *
 * Returns the health status of the application.
 * Used by load balancers, monitoring systems, and deployment pipelines.
 */

import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import type { HealthCheckResponse } from "@/types";

// Application version
const APP_VERSION = process.env.npm_package_version || "0.1.0";

export async function GET() {
  // Database check
  let databaseStatus: "connected" | "disconnected" = "disconnected";
  let dbHost = "unknown";

  try {
    const dbUrl = process.env.DATABASE_URL || "";
    // Extract host for debugging (safe - no credentials)
    const match = dbUrl.match(/@([^/]+)\//);
    dbHost = match ? match[1] : "parse-error";

    const sql = neon(dbUrl);
    await sql`SELECT 1`;
    databaseStatus = "connected";
  } catch {
    databaseStatus = "disconnected";
  }

  const overallStatus: "ok" | "degraded" | "error" =
    databaseStatus === "disconnected" ? "error" : "ok";

  const response: HealthCheckResponse & { dbHost?: string } = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    database: databaseStatus,
    version: APP_VERSION,
    dbHost, // Debug: shows which database host is being used
  };

  const statusCode = databaseStatus === "connected" ? 200 : 503;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
