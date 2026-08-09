/**
 * Input sanitization utilities.
 * Prevents XSS, SQL injection, and other injection attacks.
 * ADR-022: Input sanitization layer
 */

/**
 * Sensitive field names that should never appear in logs.
 */
const SENSITIVE_FIELDS = [
  'password', 'pass', 'secret', 'token', 'authorization',
  'cookie', 'session', 'otp', 'code', 'apikey', 'api_key', 'apikey',
  'accesstoken', 'access_token', 'refreshtoken', 'refresh_token',
  'creditcard', 'credit_card', 'cvv', 'cardnumber', 'card_number',
  'phonenumber', 'phone_number', 'nationalid', 'national_id',
];

/**
 * Strip HTML tags from a string.
 * Prevents stored XSS when rendering user content.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize a string for safe use in HTML attributes.
 * Escapes quotes and angle brackets.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize a string for safe use in URLs.
 * Removes dangerous characters.
 */
export function sanitizeForUrl(input: string): string {
  return input
    .replace(/[<>"'\x00-\x1f\x7f]/g, '')
    .trim();
}

/**
 * Remove null bytes and control characters from input.
 * Prevents null byte injection.
 */
export function stripControlChars(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize an object for logging by removing sensitive fields.
 * Deep-redacts any field whose name matches SENSITIVE_FIELDS (case-insensitive).
 */
export function sanitizeForLogging(obj: unknown, depth = 5): unknown {
  if (depth <= 0) return '[REDACTED]';
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item, depth - 1));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const keyLower = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some(f => keyLower.includes(f));
      sanitized[key] = isSensitive ? '[REDACTED]' : sanitizeForLogging(value, depth - 1);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Validate that a string doesn't contain potential SQL injection patterns.
 * Not a replacement for parameterized queries (Prisma handles that),
 * but adds defense-in-depth.
 */
export function hasSqlInjectionPatterns(input: string): boolean {
  const patterns = [
    /(?:--|;|\/\*|\*\/|xp_|sp_|exec\s|execute\s|drop\s|delete\s|insert\s|update\s|select\s|union\s)/i,
  ];
  return patterns.some(p => p.test(input));
}

/**
 * Validate that a string doesn't contain NoSQL injection patterns.
 */
export function hasNoSqlInjectionPatterns(input: string): boolean {
  const patterns = [
    /\$\{/, /\$ne/, /\$gt/, /\$lt/, /\$where/, /\$regex/,
  ];
  return patterns.some(p => p.test(input));
}

/**
 * Truncate a string to a maximum length.
 * Useful for preventing oversized inputs before validation.
 */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength);
}
