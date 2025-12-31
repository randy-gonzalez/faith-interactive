/**
 * Password Hashing Utilities
 *
 * Uses bcrypt for secure password hashing.
 *
 * SECURITY NOTES:
 * - bcrypt is intentionally slow to prevent brute-force attacks
 * - Salt is automatically generated and stored with the hash
 * - Cost factor of 12 provides good security/performance balance
 *   (approximately 250ms per hash on modern hardware)
 */

import bcrypt from "bcryptjs";

// Cost factor for bcrypt (2^12 = 4096 iterations)
// Higher = more secure but slower
// 12 is recommended for production use
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt.
 *
 * @param password - Plain text password
 * @returns Hashed password (includes salt)
 *
 * @example
 * ```typescript
 * const hash = await hashPassword("userPassword123");
 * // Store hash in database
 * ```
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a stored hash.
 *
 * @param password - Plain text password to verify
 * @param hash - Stored password hash
 * @returns true if password matches, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = await verifyPassword(inputPassword, user.passwordHash);
 * if (!isValid) {
 *   throw new Error("Invalid credentials");
 * }
 * ```
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token.
 *
 * Uses crypto.randomBytes for cryptographically secure randomness.
 *
 * @param length - Number of random bytes (default 32, produces 64-char hex string)
 * @returns Hex-encoded random token
 *
 * @example
 * ```typescript
 * const token = generateToken();
 * // "a1b2c3d4e5f6..." (64 characters)
 * ```
 */
export function generateToken(length: number = 32): string {
  const crypto = require("crypto");
  return crypto.randomBytes(length).toString("hex");
}
