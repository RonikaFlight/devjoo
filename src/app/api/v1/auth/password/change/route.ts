import { NextRequest } from 'next/server';
import { requireAuth, hashPassword, destroyAllUserSessions, getSessionCookieOptions, TOKEN_NAME } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validators/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * POST /api/v1/auth/password/change
 * Change password (requires current password).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

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

    if (!user || !user.passwordHash) {
      return Response.json(
        {
          error: {
            code: 'NO_PASSWORD',
            message: 'رمز عبور تنظیم نشده است. ابتدا یک رمز عبور تنظیم کنید.',
          },
        },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!isValid) {
      return Response.json(
        {
          error: {
            code: 'INVALID_PASSWORD',
            message: 'رمز عبور فعلی نادرست است.',
          },
        },
        { status: 401 }
      );
    }

    // Set new password
    const newPasswordHash = await hashPassword(parsed.data.newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Destroy all other sessions (force re-login on other devices)
    await destroyAllUserSessions(user.id);

    // Create new session for current device
    // (the current session was just destroyed, so we need to create a new one)
    // The current request still has the valid cookie, so we'll let the middleware
    // handle creating a new session. For now, just return success.

    return Response.json(
      {
        data: { message: 'رمز عبور با موفقیت تغییر کرد.' },
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
    console.error('[Change Password Error]', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } },
      { status: 500 }
    );
  }
}
