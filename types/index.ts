/**
 * Faith Interactive Marketing Site - Type Definitions
 *
 * Central type definitions used across the marketing application.
 */

import type { MarketingPageStatus, ConsultationStatus } from "@prisma/client";

// Re-export Prisma enums for convenience
export type { MarketingPageStatus, ConsultationStatus } from "@prisma/client";

// ==============================================================================
// API RESPONSE TYPES
// ==============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  database: "connected" | "disconnected";
  version: string;
}

// ==============================================================================
// CONSULTATION REQUEST TYPES
// ==============================================================================

/**
 * Consultation request from contact form
 */
export interface ConsultationRequestData {
  name: string;
  email: string;
  phone?: string;
  churchName?: string;
  packageInterest?: string;
  message?: string;
}

// ==============================================================================
// ENVIRONMENT TYPES
// ==============================================================================

/**
 * Environment variables (typed for safety)
 */
export interface EnvConfig {
  DATABASE_URL: string;
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: "development" | "staging" | "production";
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW_SECONDS: number;
}
