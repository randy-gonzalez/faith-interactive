/**
 * Centralized Logging Utility
 *
 * Provides structured, environment-aware logging for the application.
 *
 * FEATURES:
 * - Environment-aware verbosity (verbose in dev, quiet in prod)
 * - Structured JSON output for log aggregation
 * - Automatic credential filtering (won't log passwords, tokens, etc.)
 * - Contextual metadata support
 *
 * USAGE:
 * ```typescript
 * import { logger } from "@/lib/logging/logger";
 *
 * logger.info("User logged in", { userId: "123", churchId: "abc" });
 * logger.error("Database error", error, { query: "SELECT ..." });
 * ```
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMeta {
  [key: string]: unknown;
}

// Fields that should never be logged (case-insensitive)
const SENSITIVE_FIELDS = [
  "password",
  "passwordHash",
  "token",
  "secret",
  "apiKey",
  "authorization",
  "cookie",
  "jwt",
  "accessToken",
  "refreshToken",
  "creditCard",
  "ssn",
];

/**
 * Log level hierarchy (lower = more verbose)
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get the current log level from environment
 */
function getCurrentLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel as LogLevel;
  }
  // Default: debug in development, info in production
  return process.env.NODE_ENV === "development" ? "debug" : "info";
}

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  const currentLevel = getCurrentLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

/**
 * Filter sensitive data from an object (recursive)
 */
function filterSensitive(obj: unknown, seen = new WeakSet()): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== "object") {
    return obj;
  }

  // Handle circular references
  if (seen.has(obj as object)) {
    return "[Circular]";
  }
  seen.add(obj as object);

  if (Array.isArray(obj)) {
    return obj.map((item) => filterSensitive(item, seen));
  }

  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
      filtered[key] = "[REDACTED]";
    } else {
      filtered[key] = filterSensitive(value, seen);
    }
  }
  return filtered;
}

/**
 * Format a log entry as JSON
 */
function formatLog(
  level: LogLevel,
  message: string,
  error?: Error | null,
  meta?: LogMeta
): string {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
    env: process.env.NODE_ENV || "development",
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }

  if (meta) {
    entry.meta = filterSensitive(meta);
  }

  return JSON.stringify(entry);
}

/**
 * Logger interface
 */
export const logger = {
  /**
   * Debug level - verbose information for development
   */
  debug(message: string, meta?: LogMeta): void {
    if (shouldLog("debug")) {
      console.log(formatLog("debug", message, null, meta));
    }
  },

  /**
   * Info level - general operational information
   */
  info(message: string, meta?: LogMeta): void {
    if (shouldLog("info")) {
      console.log(formatLog("info", message, null, meta));
    }
  },

  /**
   * Warn level - potentially problematic situations
   */
  warn(message: string, meta?: LogMeta): void {
    if (shouldLog("warn")) {
      console.warn(formatLog("warn", message, null, meta));
    }
  },

  /**
   * Error level - error conditions
   */
  error(message: string, error?: Error | null, meta?: LogMeta): void {
    if (shouldLog("error")) {
      console.error(formatLog("error", message, error, meta));
    }
  },

  /**
   * Log an API request (for access logging)
   */
  request(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    meta?: LogMeta
  ): void {
    if (shouldLog("info")) {
      this.info(`${method} ${path} ${statusCode} ${durationMs}ms`, meta);
    }
  },
};
