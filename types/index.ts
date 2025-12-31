/**
 * Faith Interactive - Type Definitions
 *
 * Central type definitions used across the application.
 * These types are designed to work with the Prisma schema.
 */

import type { UserRole, ContentStatus } from "@prisma/client";

// Re-export Prisma enums for convenience
export type { UserRole, ContentStatus } from "@prisma/client";

// ==============================================================================
// TENANT TYPES
// ==============================================================================

/**
 * Minimal church/tenant representation for context passing
 */
export interface TenantContext {
  id: string;
  slug: string;
  name: string;
}

// ==============================================================================
// USER TYPES
// ==============================================================================

/**
 * Safe user object without sensitive fields (for API responses)
 */
export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

/**
 * User with tenant context (for authenticated requests)
 */
export interface AuthenticatedUser extends SafeUser {
  churchId: string;
}

// ==============================================================================
// SESSION TYPES
// ==============================================================================

/**
 * Session data stored in database
 */
export interface SessionData {
  id: string;
  userId: string;
  churchId: string;
  expiresAt: Date;
}

// ==============================================================================
// AUTH TYPES
// ==============================================================================

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  success: boolean;
  user?: SafeUser;
  error?: string;
}

/**
 * Password reset request payload
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Password reset completion payload
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

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
  status: "ok" | "error";
  timestamp: string;
  database: "connected" | "disconnected";
  version: string;
}

// ==============================================================================
// CONTENT TYPES
// ==============================================================================

/**
 * Base fields shared by all content types
 */
export interface ContentBase {
  id: string;
  churchId: string;
  status: ContentStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Page content type
 */
export interface PageContent extends ContentBase {
  title: string;
  body: string;
  urlPath: string | null;
  featuredImageUrl: string | null;
}

/**
 * Sermon content type
 */
export interface SermonContent extends ContentBase {
  title: string;
  date: Date;
  speaker: string;
  videoUrl: string | null;
  notes: string | null;
}

/**
 * Event content type
 */
export interface EventContent extends ContentBase {
  title: string;
  startDateTime: Date;
  endDateTime: Date | null;
  location: string | null;
  description: string | null;
}

/**
 * Announcement content type
 */
export interface AnnouncementContent extends ContentBase {
  title: string;
  body: string;
  expiresAt: Date | null;
}

/**
 * Leadership profile content type
 */
export interface LeadershipContent extends ContentBase {
  name: string;
  jobTitle: string | null;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  sortOrder: number;
}

// ==============================================================================
// ENVIRONMENT TYPES
// ==============================================================================

/**
 * Environment variables (typed for safety)
 */
export interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  SESSION_DURATION_DAYS: number;
  PASSWORD_RESET_EXPIRATION_HOURS: number;
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: "development" | "staging" | "production";
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW_SECONDS: number;
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
}
