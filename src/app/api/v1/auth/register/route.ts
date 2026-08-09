import { NextRequest } from 'next/server';
import { requireAuth, assignRole, isOnboardingComplete } from '@/lib/auth';
import { registerSchema } from '@/lib/validators/auth';
import { db } from '@/lib/db';

/**
 * POST /api/v1/auth/register
 * Complete onboarding: set display name and choose role.
 * Requires authenticated session (user must have verified OTP/OAuth first).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

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

    const { displayName, role } = parsed.data;
    const userId = auth.user.id;

    // Assign the selected role
    await assignRole(userId, role);

    // Create or update profile
    const existingProfile = auth.user.profile;

    if (existingProfile) {
      await db.profile.update({
        where: { id: existingProfile.id },
        data: { displayName },
      });
    } else {
      await db.profile.create({
        data: {
          userId,
          displayName,
        },
      });
    }

    // Also update user displayName
    await db.user.update({
      where: { id: userId },
      data: { displayName },
    });

    return Response.json(
      {
        data: {
          message: 'حساب کاربری با موفقیت ایجاد شد.',
          user: {
            id: userId,
            displayName,
            role,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const authErr = error as { code: string; statusCode: number; message: string };
      return Response.json(
        {
          error: {
            code: authErr.code,
            message: authErr.message,
          },
        },
        { status: authErr.statusCode }
      );
    }
    console.error('[Register Error]', error);
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
