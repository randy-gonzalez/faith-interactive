// ==============================================================================
// ENHANCED SPAM PROTECTION
// ==============================================================================
// Multi-layered spam protection for form submissions:
// 1. Multiple hidden honeypot fields with randomized names
// 2. Time-based validation (minimum submission time)
// 3. Per-IP rate limiting
// ==============================================================================

import crypto from 'crypto';

// ==============================================================================
// HONEYPOT CONFIGURATION
// ==============================================================================

// Field name prefixes that look legitimate to bots
const HONEYPOT_PREFIXES = [
  'website',
  'homepage',
  'url',
  'link',
  'site',
  'company',
  'fax',
  'address2',
];

// Field name suffixes
const HONEYPOT_SUFFIXES = ['', '_url', '_field', '_input', '_value', '_info'];

/**
 * Generate a random honeypot field name
 */
export function generateHoneypotFieldName(): string {
  const prefix = HONEYPOT_PREFIXES[Math.floor(Math.random() * HONEYPOT_PREFIXES.length)];
  const suffix = HONEYPOT_SUFFIXES[Math.floor(Math.random() * HONEYPOT_SUFFIXES.length)];
  return `${prefix}${suffix}`;
}

/**
 * Generate multiple honeypot field names for enhanced protection
 */
export function generateHoneypotFieldNames(count: number = 2): string[] {
  const names: string[] = [];
  const usedPrefixes = new Set<string>();

  while (names.length < count && usedPrefixes.size < HONEYPOT_PREFIXES.length) {
    const name = generateHoneypotFieldName();
    const prefix = name.split('_')[0];

    if (!usedPrefixes.has(prefix)) {
      names.push(name);
      usedPrefixes.add(prefix);
    }
  }

  return names;
}

/**
 * Check if any honeypot fields have been filled
 * Returns true if spam is detected
 */
export function checkHoneypot(
  data: Record<string, unknown>,
  honeypotFieldNames: string[]
): boolean {
  for (const fieldName of honeypotFieldNames) {
    const value = data[fieldName];
    if (value !== undefined && value !== null && value !== '') {
      return true; // Spam detected
    }
  }
  return false;
}

// ==============================================================================
// TIME-BASED VALIDATION
// ==============================================================================

const TIMESTAMP_SECRET = process.env.FORM_TIMESTAMP_SECRET || 'default-form-secret-change-me';
const TIMESTAMP_ALGORITHM = 'aes-256-cbc';

/**
 * Generate an encrypted timestamp token
 * This is embedded in the form and validated on submission
 */
export function generateTimestampToken(): string {
  const timestamp = Date.now().toString();
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(TIMESTAMP_SECRET, 'salt', 32);
  const cipher = crypto.createCipheriv(TIMESTAMP_ALGORITHM, key, iv);

  let encrypted = cipher.update(timestamp, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Combine IV and encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt and validate a timestamp token
 * Returns the elapsed time in seconds, or null if invalid
 */
export function validateTimestampToken(token: string): number | null {
  try {
    const [ivHex, encrypted] = token.split(':');
    if (!ivHex || !encrypted) return null;

    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(TIMESTAMP_SECRET, 'salt', 32);
    const decipher = crypto.createDecipheriv(TIMESTAMP_ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const timestamp = parseInt(decrypted, 10);
    if (isNaN(timestamp)) return null;

    const elapsed = (Date.now() - timestamp) / 1000; // Convert to seconds
    return elapsed;
  } catch {
    return null;
  }
}

/**
 * Check if submission time is valid
 * Returns true if the submission is too fast (likely a bot)
 */
export function isSubmissionTooFast(token: string, minSeconds: number = 3): boolean {
  const elapsed = validateTimestampToken(token);

  if (elapsed === null) {
    // Invalid token - could be a bot that didn't load the form properly
    // Be lenient and allow the submission (other protections will catch bots)
    return false;
  }

  return elapsed < minSeconds;
}

/**
 * Check if submission time is suspiciously old (form loaded days ago)
 * Could indicate a replay attack
 */
export function isSubmissionTooOld(token: string, maxHours: number = 24): boolean {
  const elapsed = validateTimestampToken(token);

  if (elapsed === null) {
    return false;
  }

  const maxSeconds = maxHours * 60 * 60;
  return elapsed > maxSeconds;
}

// ==============================================================================
// COMPREHENSIVE SPAM CHECK
// ==============================================================================

export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

export interface SpamCheckOptions {
  honeypotFieldNames?: string[];
  timestampToken?: string;
  minSubmitTime?: number;
  maxSubmitTime?: number; // In hours
}

/**
 * Perform comprehensive spam check
 */
export function performSpamCheck(
  data: Record<string, unknown>,
  options: SpamCheckOptions = {}
): SpamCheckResult {
  const {
    honeypotFieldNames = [],
    timestampToken,
    minSubmitTime = 3,
    maxSubmitTime = 24,
  } = options;

  // Check honeypot fields
  if (honeypotFieldNames.length > 0 && checkHoneypot(data, honeypotFieldNames)) {
    return { isSpam: true, reason: 'honeypot' };
  }

  // Check timing if token provided
  if (timestampToken) {
    if (isSubmissionTooFast(timestampToken, minSubmitTime)) {
      return { isSpam: true, reason: 'too_fast' };
    }

    if (isSubmissionTooOld(timestampToken, maxSubmitTime)) {
      return { isSpam: true, reason: 'too_old' };
    }
  }

  return { isSpam: false };
}

// ==============================================================================
// CSS FOR HONEYPOT FIELDS
// ==============================================================================

/**
 * CSS styles to hide honeypot fields
 * Uses multiple techniques to avoid bot detection
 */
export const HONEYPOT_CSS = `
  .hp-field {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    height: 0;
    width: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
  }
  .hp-field input,
  .hp-field textarea {
    padding: 0;
    margin: 0;
    border: 0;
  }
`;

/**
 * Generate HTML for honeypot fields
 * These should be included in the form but hidden from users
 */
export function generateHoneypotFieldsHtml(fieldNames: string[]): string {
  return fieldNames
    .map(
      (name) => `
      <div class="hp-field" aria-hidden="true" tabindex="-1">
        <label for="${name}">${name.replace('_', ' ')}</label>
        <input type="text" name="${name}" id="${name}" autocomplete="off" tabindex="-1" />
      </div>
    `
    )
    .join('\n');
}

// ==============================================================================
// RATE LIMITING HELPERS
// ==============================================================================

// Rate limit configuration per form type
export const RATE_LIMITS = {
  CONTACT: { requests: 5, windowSeconds: 3600 }, // 5 per hour
  PRAYER_REQUEST: { requests: 3, windowSeconds: 3600 }, // 3 per hour
  VOLUNTEER: { requests: 3, windowSeconds: 3600 }, // 3 per hour
  CUSTOM: { requests: 10, windowSeconds: 3600 }, // 10 per hour
} as const;

/**
 * Get rate limit configuration for a form type
 */
export function getRateLimitConfig(formType: keyof typeof RATE_LIMITS): {
  requests: number;
  windowSeconds: number;
} {
  return RATE_LIMITS[formType] || RATE_LIMITS.CUSTOM;
}
