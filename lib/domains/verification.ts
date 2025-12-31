/**
 * Domain Verification Utilities
 *
 * Handles DNS TXT record verification for custom domains.
 * Users add a TXT record like: _fi-verify.example.com TXT "fi-verify=abc123"
 * We then look up this record to verify domain ownership.
 */

import { resolve } from "dns";
import { promisify } from "util";

const resolveTxt = promisify(resolve);

/**
 * Generate a secure verification token.
 * Uses crypto.randomUUID for a unique, unpredictable token.
 */
export function generateVerificationToken(): string {
  // Use crypto.randomUUID for a secure, unique token
  // Format: 8-4-4-4-12 characters = 36 total
  return crypto.randomUUID();
}

/**
 * Verification result from DNS lookup.
 */
export interface VerificationResult {
  verified: boolean;
  reason?: string;
  foundRecords?: string[];
}

/**
 * Verify domain ownership via DNS TXT record.
 *
 * Looks for a TXT record at _fi-verify.{hostname} with value fi-verify={token}.
 *
 * @param hostname - The domain to verify (e.g., "www.example.com")
 * @param expectedToken - The verification token we're looking for
 * @returns Verification result
 *
 * @example
 * // If user adds: _fi-verify.example.com TXT "fi-verify=abc-123-def"
 * const result = await verifyDomainDNS("example.com", "abc-123-def");
 * // result.verified === true
 */
export async function verifyDomainDNS(
  hostname: string,
  expectedToken: string
): Promise<VerificationResult> {
  const verificationDomain = `_fi-verify.${hostname}`;
  const expectedValue = `fi-verify=${expectedToken}`;

  try {
    // Look up TXT records for the verification subdomain
    const records = await resolveTxtRecords(verificationDomain);

    if (!records || records.length === 0) {
      return {
        verified: false,
        reason: `No TXT records found at ${verificationDomain}. Please add the TXT record and wait for DNS propagation.`,
        foundRecords: [],
      };
    }

    // Check if any record matches our expected value
    // TXT records can be split into chunks, so we join them
    const flatRecords = records.map((r) => (Array.isArray(r) ? r.join("") : r));

    const found = flatRecords.some(
      (record) => record.trim() === expectedValue
    );

    if (found) {
      return {
        verified: true,
        foundRecords: flatRecords,
      };
    }

    return {
      verified: false,
      reason: `TXT record found but value doesn't match. Expected "${expectedValue}".`,
      foundRecords: flatRecords,
    };
  } catch (error) {
    // Handle DNS lookup errors
    if (error instanceof Error) {
      const dnsError = error as NodeJS.ErrnoException;

      if (dnsError.code === "ENODATA" || dnsError.code === "ENOTFOUND") {
        return {
          verified: false,
          reason: `No TXT records found at ${verificationDomain}. Please add the TXT record and wait for DNS propagation (can take up to 48 hours).`,
          foundRecords: [],
        };
      }

      if (dnsError.code === "ETIMEOUT") {
        return {
          verified: false,
          reason: "DNS lookup timed out. Please try again in a few minutes.",
          foundRecords: [],
        };
      }
    }

    // Generic error
    return {
      verified: false,
      reason: "DNS lookup failed. Please check the domain configuration and try again.",
      foundRecords: [],
    };
  }
}

/**
 * Resolve TXT records for a domain.
 * Uses Node.js DNS resolver with fallback.
 */
async function resolveTxtRecords(domain: string): Promise<string[][] | null> {
  try {
    // Node.js dns.resolveTxt returns arrays of string arrays
    // Each TXT record is an array of strings (for records > 255 chars)
    const { Resolver } = await import("dns").then((m) => m.promises);
    const resolver = new Resolver();

    // Use Google's and Cloudflare's DNS for reliability
    resolver.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

    const records = await resolver.resolveTxt(domain);
    return records;
  } catch (error) {
    // Re-throw DNS-specific errors for handling above
    throw error;
  }
}

/**
 * Normalize a hostname for storage.
 * - Lowercase
 * - Remove trailing dot
 * - Trim whitespace
 */
export function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().trim().replace(/\.$/, "");
}

/**
 * Validate hostname format.
 * Returns true if the hostname is valid.
 */
export function isValidHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);

  // Basic hostname validation
  // - 4-253 characters
  // - alphanumeric plus hyphens
  // - labels separated by dots
  // - no leading/trailing hyphens in labels
  if (normalized.length < 4 || normalized.length > 253) {
    return false;
  }

  const hostnameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/;
  return hostnameRegex.test(normalized);
}
