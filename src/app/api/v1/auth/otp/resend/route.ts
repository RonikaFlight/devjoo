import { NextRequest } from 'next/server';
import { requestOtp } from '@/lib/auth/otp';
import { otpResendSchema } from '@/lib/validators/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = otpResendSchema.safeParse(body);

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

    const result = await requestOtp(parsed.data.phone);

    if (!result.success) {
      return Response.json(
        {
          error: {
            code: 'OTP_LIMIT_EXCEEDED',
            message: result.error,
          },
        },
        { status: 429 }
      );
    }

    return Response.json(
      {
        data: {
          message: 'کد تایید مجدد ارسال شد.',
          ...(result.devCode ? { devCode: result.devCode } : {}),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[OTP Resend Error]', error);
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
