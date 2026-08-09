/**
 * Request ID generation and propagation.
 * Each request gets a unique ID for tracing through logs.
 * ADR-022: Request correlation
 */

/**
 * Generate a unique request ID.
 * Format: 8-char hex timestamp + 16-char random hex = 24 chars total.
 * Example: 4f2a1b3c_a1b2c3d4e5f6a7b8
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(16).slice(-8);
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  return `${timestamp}_${random}`;
}

/**
 * Extract request ID from request headers or generate a new one.
 * Supports x-request-id header for distributed tracing.
 */
export function getOrCreateRequestId(request: Request): string {
  const existing = request.headers.get('x-request-id');
  if (existing && existing.length >= 8 && existing.length <= 64) {
    return existing;
  }
  return generateRequestId();
}
