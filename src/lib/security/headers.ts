/**
 * Security headers configuration.
 * Applied to all responses via middleware.
 * ADR-022: Defense-in-depth security headers
 */

export interface SecurityHeadersConfig {
  isProduction: boolean;
}

/**
 * Get security headers for all responses.
 * These headers protect against common web vulnerabilities.
 */
export function getSecurityHeaders(config: SecurityHeadersConfig): Record<string, string> {
  const { isProduction } = config;

  // Frame-ancestors: allow same-origin only, plus iframe embedding from our own domain
  const frameAncestors = isProduction
    ? "'self' https://devjoo.ir"
    : "'self'";

  return {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // Modern CSP frame-ancestors (X-Frame-Options is still useful for older browsers)
    'Content-Security-Policy': `frame-ancestors ${frameAncestors}`,
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // XSS protection (legacy, still useful for older browsers)
    'X-XSS-Protection': '1; mode=block',
    // Referrer policy — send origin only on cross-origin requests
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Permissions policy — disable features we don't use
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    // HSTS in production — force HTTPS for 1 year, include subdomains
    ...(isProduction ? {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    } : {}),
    // No DNS prefetching for privacy
    'X-DNS-Prefetch-Control': 'on',
    // Download options — prevent opening files in the browser context
    'X-Download-Options': 'noopen',
  };
}

/**
 * CORS headers for API routes.
 * In production, only allow devjoo.ir origins.
 * In development, allow all localhost origins.
 */
export function getCorsHeaders(origin: string | null, isProduction: boolean): Record<string, string> {
  const allowedOrigins = isProduction
    ? ['https://devjoo.ir', 'https://www.devjoo.ir', 'https://api.devjoo.ir']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

  const isAllowed = origin && allowedOrigins.some(allowed => origin.startsWith(allowed));

  if (!isAllowed && isProduction) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin || allowedOrigins[0] : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours preflight cache
  };
}