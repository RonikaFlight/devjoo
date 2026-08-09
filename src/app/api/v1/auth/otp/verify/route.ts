import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/auth/otp';
import { findOrCreateUserByPhone, createSession, getSessionCookieOptions } from '@/lib/auth';
import { otpVerifySchema } from '@/lib/validators/auth';

export async function POST(request: NextRequest) {
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
        },
        { status: 400 }
      );
    }

    const { phone, code } = parsed.data;
    const result = await verifyOtp(phone, code);

    if (!result.success) {
      return Response.json(
        {
          error: {
            code: 'OTP_INVALID',
            message: result.error,
          },
        },
        { status: 401 }
      );
    }

    // Find or create user
    const user = await findOrCreateUserByPhone(phone);

    // Create session
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const { token } = await createSession(user.id, ip, userAgent);

    // Check if user has completed onboarding
    const hasRoles = user.roles.length > 0;
    const hasProfile = user.profile?.displayName;
    const needsOnboarding = !hasRoles || !hasProfile;

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
    console.error('[OTP Verify Error]', error);
    return Response.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'خطای داخلی سرور.',
        },
      },
      { status: 500 }
    );
  }
}
