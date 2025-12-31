/**
 * Health Check API Route
 *
 * GET /api/health
 *
 * Returns the health status of the application.
 * Used by load balancers, monitoring systems, and deployment pipelines.
 *
 * This route is intentionally public and does not require tenant context.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { HealthCheckResponse } from "@/types";

// Application version (could be from package.json or build info)
const APP_VERSION = process.env.npm_package_version || "0.1.0";

export async function GET() {
  let databaseStatus: "connected" | "disconnected" = "disconnected";

  try {
    // Check database connectivity with a simple query
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = "connected";
  } catch {
    // Database is not reachable
    databaseStatus = "disconnected";
  }

  const response: HealthCheckResponse = {
    status: databaseStatus === "connected" ? "ok" : "error",
    timestamp: new Date().toISOString(),
    database: databaseStatus,
    version: APP_VERSION,
  };

  // Return 503 if database is down (useful for load balancer health checks)
  const statusCode = databaseStatus === "connected" ? 200 : 503;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      // Prevent caching of health check responses
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
