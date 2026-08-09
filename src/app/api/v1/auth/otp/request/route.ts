import { NextRequest } from 'next/server';
import { requestOtp } from '@/lib/auth/otp';
import { otpRequestSchema } from '@/lib/validators/auth';
import { createRateLimitGuard, getClientIp } from '@/lib/security/rate-limiter';
import { logger } from '@/lib/logger';

const otpRateLimit = createRateLimitGuard('otp', (req) => {
  // Rate limit by IP for OTP requests
  return `otp:${getClientIp(req)}`;
});

export async function POST(request: NextRequest) {
  // Rate limit check
  const rateLimitResponse = otpRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const requestId = request.headers.get('x-request-id') || '';
  const reqLogger = logger.child({ requestId, path: '/api/v1/auth/otp/request', method: 'POST' });

  try {
    const body = await request.json();
    const parsed = otpRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'اطلاعات ورودی نامعتبر است.',
            details: parsed.error.issues.map((i) => i.message),
          },
          requestId,
        },
        { status: 400 }
      );
    }

    reqLogger.info('OTP request', { phonePrefix: parsed.data.phone.slice(0, 4) + '****' });
    const result = await requestOtp(parsed.data.phone);

    if (!result.success) {
      return Response.json(
        {
          error: {
            code: 'OTP_LIMIT_EXCEEDED',
            message: result.error,
          },
          requestId,
        },
        { status: 429 }
      );
    }

    return Response.json(
      {
        data: {
          message: 'کد تایید ارسال شد.',
          ...(result.devCode ? { devCode: result.devCode } : {}),
        },
        requestId,
      },
      { status: 200 }
    );
  } catch (error) {
    reqLogger.error('OTP request failed', error);
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
}
