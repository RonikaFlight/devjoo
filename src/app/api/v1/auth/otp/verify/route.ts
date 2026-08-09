import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/auth/otp';
import { findOrCreateUserByPhone, createSession, getSessionCookieOptions } from '@/lib/auth';
import { otpVerifySchema } from '@/lib/validators/auth';
import { createRateLimitGuard, getClientIp } from '@/lib/security/rate-limiter';
import { logger } from '@/lib/logger';

const loginRateLimit = createRateLimitGuard('login', (req) => `login:${getClientIp(req)}`);

export async function POST(request: NextRequest) {
  // Rate limit login attempts by IP
  const rateLimitResponse = loginRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const requestId = request.headers.get('x-request-id') || '';
  const reqLogger = logger.child({ requestId, path: '/api/v1/auth/otp/verify', method: 'POST' });

  try {
    const body = await request.json();
    const parsed = otpVerifySchema.safeParse(body);

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

    const { phone, code } = parsed.data;
    reqLogger.info('OTP verify attempt', { phonePrefix: phone.slice(0, 4) + '****' });
    const result = await verifyOtp(phone, code);

    if (!result.success) {
      reqLogger.warn('OTP verify failed', { reason: result.error });
      return Response.json(
        {
          error: {
            code: 'OTP_INVALID',
            message: result.error,
          },
          requestId,
        },
        { status: 401 }
      );
    }

    // Find or create user
    const user = await findOrCreateUserByPhone(phone);

    // Create session
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;
    const { token } = await createSession(user.id, ip, userAgent);

    // Check if user has completed onboarding
    const hasRoles = user.roles.length > 0;
    const hasProfile = user.profile?.displayName;
    const needsOnboarding = !hasRoles || !hasProfile;

    reqLogger.info('User logged in via OTP', {
      userId: user.id,
      needsOnboarding,
      ip,
    });

    // Set cookie
    const cookieOptions = getSessionCookieOptions();
    const response = NextResponse.json(
      {
        data: {
          user: {
            id: user.id,
            phone: user.phone,
            displayName: user.displayName,
            hasProfile: !!user.profile,
            roles: user.roles.map((r) => r.role.name),
          },
          needsOnboarding,
        },
        requestId,
      },
      { status: 200 }
    );

    response.cookies.set(cookieOptions.name, token, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: cookieOptions.maxAge,
    });

    return response;
  } catch (error) {
    reqLogger.error('OTP verify failed', error);
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
