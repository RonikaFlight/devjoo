import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, authErrorResponse, AuthError } from '@/lib/auth/helpers';
import { USER_ROLES } from '@/types/enums';
import {
  listAdminRedirects,
  createAdminRedirect,
} from '@/modules/admin/service';
import { adminRedirectSchema } from '@/lib/validators/admin';

/**
 * GET /api/v1/admin/redirects — لیست ریدایرکت‌ها
 */
export async function GET(_request: NextRequest) {
  try {
    await requireRole(USER_ROLES.ADMIN);

    const result = await listAdminRedirects();

    return NextResponse.json({ redirects: result });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای داخلی سرور' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/redirects — ایجاد ریدایرکت جدید
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole(USER_ROLES.ADMIN);

    const body = await request.json();
    const parsed = adminRedirectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'داده‌های ورودی نامعتبر',
            details: parsed.error.issues.map((e) => e.message),
          },
        },
        { status: 400 }
      );
    }

    const result = await createAdminRedirect(user.id, parsed.data);

    return NextResponse.json({ redirect: result.redirect });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'داده‌های ورودی نامعتبر',
            details: error.issues.map((e) => e.message),
          },
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای داخلی سرور' } },
      { status: 500 }
    );
  }
}
