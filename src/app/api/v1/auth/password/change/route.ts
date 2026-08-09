import { NextRequest } from 'next/server';
import { requireAuth, hashPassword, destroyAllUserSessions, authErrorResponse } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validators/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createRateLimitGuard } from '@/lib/security/rate-limiter';
import { logger } from '@/lib/logger';

const pwdChangeLimit = createRateLimitGuard('passwordChange', (req) => {
  // Extract userId from cookie — rate limit per user
  // Since requireAuth hasn't run yet, we use IP as fallback
  const forwarded = req.headers.get('x-forwarded-for');
  return `pwd-change:${forwarded?.split(',')[0]?.trim() || 'unknown'}`;
});

/**
 * POST /api/v1/auth/password/change
 * Change password (requires current password).
 */
export async function POST(request: NextRequest) {
  // Rate limit first (before auth)
  const rateLimitResponse = pwdChangeLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const requestId = request.headers.get('x-request-id') || '';
  const reqLogger = logger.child({ requestId, path: '/api/v1/auth/password/change', method: 'POST' });

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
          requestId,
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
          requestId,
        },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!isValid) {
      reqLogger.warn('Password change failed: invalid current password', { userId: auth.user.id });
      return Response.json(
        {
          error: {
            code: 'INVALID_PASSWORD',
            message: 'رمز عبور فعلی نادرست است.',
          },
          requestId,
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

    reqLogger.info('Password changed successfully', { userId: auth.user.id });

    return Response.json(
      {
        data: { message: 'رمز عبور با موفقیت تغییر کرد.' },
        requestId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      return authErrorResponse(error as ReturnType<typeof requireAuth> extends Promise<infer T> ? never : never);
    }
    reqLogger.error('Password change failed', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' }, requestId },
      { status: 500 }
    );
  }
}
