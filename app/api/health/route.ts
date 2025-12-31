/**
 * Health Check API Route
 *
 * GET /api/health
 *
 * Returns the health status of the application.
 * Used by load balancers, monitoring systems, and deployment pipelines.
 *
 * This route is intentionally public and does not require tenant context.
 *
 * Phase 5: Enhanced with storage checks and latency metrics.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { existsSync, accessSync, constants } from "fs";
import type { HealthCheckResponse } from "@/types";

// Application version (could be from package.json or build info)
const APP_VERSION = process.env.npm_package_version || "0.1.0";

// Track process start time for uptime calculation
const PROCESS_START_TIME = Date.now();

// Storage directory to check
const STORAGE_PATH = process.env.STORAGE_PATH || "./storage";

export async function GET() {
  // Database check with latency measurement
  let databaseStatus: "connected" | "disconnected" = "disconnected";
  let dbLatencyMs: number | undefined;

  try {
    const dbStart = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Math.round(performance.now() - dbStart);
    databaseStatus = "connected";
  } catch {
    databaseStatus = "disconnected";
  }

  // Storage check (Phase 5)
  let storageStatus: "ok" | "error" | "unknown" = "unknown";
  let storageMessage: string | undefined;

  try {
    // Check if storage directory exists and is writable
    if (existsSync(STORAGE_PATH)) {
      accessSync(STORAGE_PATH, constants.R_OK | constants.W_OK);
      storageStatus = "ok";
    } else {
      // Storage path doesn't exist - might be using cloud storage
      storageStatus = "unknown";
      storageMessage = "Local storage path not configured";
    }
  } catch (error) {
    storageStatus = "error";
    storageMessage = error instanceof Error ? error.message : "Storage check failed";
  }

  // Calculate overall status
  const overallStatus: "ok" | "degraded" | "error" =
    databaseStatus === "disconnected"
      ? "error"
      : storageStatus === "error"
        ? "degraded"
        : "ok";

  // Calculate uptime
  const uptimeSeconds = Math.floor((Date.now() - PROCESS_START_TIME) / 1000);

  const response: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    database: databaseStatus,
    storage: storageStatus,
    version: APP_VERSION,
    uptime: uptimeSeconds,
    checks: {
      database: {
        status: databaseStatus === "connected" ? "ok" : "error",
        latencyMs: dbLatencyMs,
      },
      storage: {
        status: storageStatus,
        message: storageMessage,
      },
    },
  };

  // Return 503 if database is down, 200 otherwise (even if degraded)
  // Degraded means the app can still serve requests
  const statusCode = databaseStatus === "connected" ? 200 : 503;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      // Prevent caching of health check responses
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
