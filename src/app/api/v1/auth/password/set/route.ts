import { NextRequest } from 'next/server';
import { requireAuth, hashPassword } from '@/lib/auth';
import { setPasswordSchema } from '@/lib/validators/auth';
import { db } from '@/lib/db';

/**
 * POST /api/v1/auth/password/set
 * Set password for users who signed up via OTP/OAuth (no password yet).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();
    const parsed = setPasswordSchema.safeParse(body);

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

    const user = await db.user.findUnique({
      where: { id: auth.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'کاربر یافت نشد.' } },
        { status: 404 }
      );
    }

    if (user.passwordHash) {
      return Response.json(
        {
          error: {
            code: 'PASSWORD_ALREADY_SET',
            message: 'رمز عبور از قبل تنظیم شده است. از بخش تغییر رمز استفاده کنید.',
          },
        },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return Response.json(
      {
        data: { message: 'رمز عبور با موفقیت تنظیم شد.' },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const authErr = error as { code: string; statusCode: number; message: string };
      return Response.json(
        { error: { code: authErr.code, message: authErr.message } },
        { status: authErr.statusCode }
      );
    }
    console.error('[Set Password Error]', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } },
      { status: 500 }
    );
  }
}
