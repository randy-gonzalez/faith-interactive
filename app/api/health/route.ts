/**
 * Health Check API Route
 *
 * GET /api/health
 *
 * Returns the health status of the application.
 * Used by load balancers, monitoring systems, and deployment pipelines.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { HealthCheckResponse } from "@/types";

// Application version
const APP_VERSION = process.env.npm_package_version || "0.1.0";

export async function GET() {
  // Database check
  let databaseStatus: "connected" | "disconnected" = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = "connected";
  } catch {
    databaseStatus = "disconnected";
  }

  const overallStatus: "ok" | "degraded" | "error" =
    databaseStatus === "disconnected" ? "error" : "ok";

  const response: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    database: databaseStatus,
    version: APP_VERSION,
  };

  const statusCode = databaseStatus === "connected" ? 200 : 503;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
