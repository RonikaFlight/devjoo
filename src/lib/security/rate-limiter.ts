/**
 * In-memory rate limiter for API routes.
 * Uses a sliding window counter per identifier.
 * 
 * Production note: Replace with Redis-backed rate limiter for multi-instance deployments.
 * ADR-022: Per-action rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  /** Maximum number of requests in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

// In-memory store — map of identifier → entry
const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (!cleanupTimer) {
    cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store) {
        if (entry.resetAt <= now) {
          store.delete(key);
        }
      }
    }, CLEANUP_INTERVAL);
    // Don't prevent process exit
    if (cleanupTimer.unref) cleanupTimer.unref();
  }
}

/**
 * Check rate limit for a given identifier.
 * Returns { success, remaining, resetAt, limit }.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  ensureCleanup();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = `${identifier}:${Math.floor(now / windowMs)}`;

  const existing = store.get(key);
  const resetAt = (Math.floor(now / windowMs) + 1) * windowMs;

  if (existing && existing.resetAt > now) {
    if (existing.count >= config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetAt: existing.resetAt,
        limit: config.maxRequests,
      };
    }
    existing.count++;
    return {
      success: true,
      remaining: config.maxRequests - existing.count,
      resetAt: existing.resetAt,
      limit: config.maxRequests,
    };
  }

  store.set(key, { count: 1, resetAt });
  return {
    success: true,
    remaining: config.maxRequests - 1,
    resetAt,
    limit: config.maxRequests,
  };
}

/**
 * Pre-configured rate limit presets for common actions.
 */
export const RATE_LIMITS = {
  /** General API: 60 req/min per IP */
  api: { maxRequests: 60, windowSeconds: 60 },
  /** Auth endpoints: 10 req/min per IP */
  auth: { maxRequests: 10, windowSeconds: 60 },
  /** OTP: 2 req/min per phone (enforced in otp.ts too) */
  otp: { maxRequests: 2, windowSeconds: 60 },
  /** Password change: 3 req/hour per user */
  passwordChange: { maxRequests: 3, windowSeconds: 3600 },
  /** Project creation: 5 req/hour per user */
  projectCreate: { maxRequests: 5, windowSeconds: 3600 },
  /** Proposal submission: 10 req/hour per user */
  proposalSubmit: { maxRequests: 10, windowSeconds: 3600 },
  /** File upload: 10 req/min per user */
  upload: { maxRequests: 10, windowSeconds: 60 },
  /** AI endpoints: 10 req/min per user */
  ai: { maxRequests: 10, windowSeconds: 60 },
  /** Login attempts: 5 req/5min per IP */
  login: { maxRequests: 5, windowSeconds: 300 },
  /** Admin API: 120 req/min per user */
  admin: { maxRequests: 120, windowSeconds: 60 },
  /** Search/feed: 30 req/min per user */
  search: { maxRequests: 30, windowSeconds: 60 },
} as const;

export type RateLimitPreset = keyof typeof RATE_LIMITS;

/**
 * Create a rate-limited API handler wrapper.
 * Usage in route handlers:
 *   const rateLimit = createRateLimitHandler('auth');
 *   if (rateLimit) return rateLimit; // returns 429 if limited
 */
export function createRateLimitGuard(
  preset: RateLimitPreset,
  getIdentifier: (request: Request) => string
): (request: Request) => Response | null {
  return (request: Request) => {
    const identifier = getIdentifier(request);
    const result = checkRateLimit(identifier, RATE_LIMITS[preset]);

    if (!result.success) {
      return Response.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.',
          },
          meta: {
            remaining: result.remaining,
            resetAt: new Date(result.resetAt).toISOString(),
            limit: result.limit,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
          },
        }
      );
    }

    return null;
  };
}

/**
 * Get client IP from request headers.
 * Checks common proxy headers, falls back to remote address.
 */
export function getClientIp(request: Request): string {
  // In Next.js middleware, x-forwarded-for is set by the platform
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return '127.0.0.1';
}
