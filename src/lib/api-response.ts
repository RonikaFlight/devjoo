/**
 * Standardized API response helpers.
 * Ensures all API routes return consistent response format.
 * ADR-022: Consistent API response format
 */

import { sanitizeForLogging } from '@/lib/security/sanitize';
import { logger } from '@/lib/logger';

interface ApiErrorOptions {
  code: string;
  message: string;
  statusCode?: number;
  details?: string[];
  /** Request ID for tracing */
  requestId?: string;
}

/**
 * Success response helper.
 */
export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, statusCode = 200) {
  return Response.json(
    { data, ...(meta ? { meta } : {}) },
    { status: statusCode }
  );
}

/**
 * Error response helper.
 */
export function apiError(options: ApiErrorOptions) {
  const { code, message, statusCode = 400, details, requestId } = options;

  const response: Record<string, unknown> = {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };

  if (requestId) {
    response.requestId = requestId;
  }

  return Response.json(response, { status: statusCode });
}

/**
 * 401 Unauthorized response.
 */
export function unauthorized(requestId?: string) {
  return apiError({
    code: 'UNAUTHORIZED',
    message: 'لطفاً وارد حساب کاربری خود شوید.',
    statusCode: 401,
    requestId,
  });
}

/**
 * 403 Forbidden response.
 */
export function forbidden(message = 'شما دسترسی لازم برای این عملیات را ندارید.', requestId?: string) {
  return apiError({
    code: 'FORBIDDEN',
    message,
    statusCode: 403,
    requestId,
  });
}

/**
 * 404 Not Found response.
 */
export function notFound(message = 'منبع درخواستی یافت نشد.', requestId?: string) {
  return apiError({
    code: 'NOT_FOUND',
    message,
    statusCode: 404,
    requestId,
  });
}

/**
 * 429 Rate Limited response.
 */
export function rateLimited(retryAfterSeconds: number, requestId?: string) {
  return Response.json(
    {
      error: {
        code: 'RATE_LIMITED',
        message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.',
      },
      ...(requestId ? { requestId } : {}),
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    }
  );
}

/**
 * 500 Internal Server Error response.
 */
export function internalError(requestId?: string) {
  return apiError({
    code: 'INTERNAL_ERROR',
    message: 'خطای داخلی سرور.',
    statusCode: 500,
    requestId,
  });
}

/**
 * Validation error response.
 */
export function validationError(details: string[], requestId?: string) {
  return apiError({
    code: 'VALIDATION_ERROR',
    message: 'پارامترهای نامعتبر.',
    statusCode: 400,
    details,
    requestId,
  });
}

/**
 * Wrap an API handler with error handling, request ID, and structured logging.
 * Usage:
 *   export const GET = withHandler(async (req, requestId, logger) => { ... });
 */
export type ApiHandler<T = unknown> = (
  request: Request,
  requestId: string,
  logger: ReturnType<typeof import('@/lib/logger').createLogger>
) => Promise<Response>;

export function withHandler<T>(handler: ApiHandler<T>) {
  return async (request: Request): Promise<Response> => {
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID().slice(0, 24);
    const requestLogger = logger.child({
      requestId,
      path: new URL(request.url).pathname,
      method: request.method,
    });

    const start = Date.now();
    try {
      const response = await handler(request, requestId, requestLogger);
      const duration = Date.now() - start;
      requestLogger.info('API request completed', {
        statusCode: response.status,
        durationMs: duration,
      });
      return response;
    } catch (error: unknown) {
      const duration = Date.now() - start;
      requestLogger.error('API request failed', error, { durationMs: duration });

      if (error && typeof error === 'object' && 'code' in error) {
        const e = error as { code: string; statusCode?: number; message: string };
        return apiError({
          code: e.code,
          message: e.message,
          statusCode: e.statusCode || 500,
          requestId,
        });
      }

      return Response.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'خطای داخلی سرور.',
          },
          requestId,
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Sanitize and log request body (for debugging).
 * Never logs sensitive fields.
 */
export function logRequestBody(requestId: string, body: unknown): void {
  logger.child({ requestId }).debug('Request body', {
    body: sanitizeForLogging(body),
  });
}
