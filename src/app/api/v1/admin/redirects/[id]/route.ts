import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, authErrorResponse, AuthError } from '@/lib/auth/helpers';
import { USER_ROLES } from '@/types/enums';
import {
  updateAdminRedirect,
  deleteAdminRedirect,
} from '@/modules/admin/service';
import { adminRedirectSchema } from '@/lib/validators/admin';

/**
 * PATCH /api/v1/admin/redirects/[id] — به‌روزرسانی ریدایرکت
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireRole(USER_ROLES.ADMIN);
    const { id } = await params;

    const body = await request.json();
    const parsed = adminRedirectSchema.partial().safeParse(body);
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

    const result = await updateAdminRedirect(user.id, id, parsed.data);

    if ('error' in result) {
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: 404 }
      );
    }

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

/**
 * DELETE /api/v1/admin/redirects/[id] — حذف ریدایرکت
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireRole(USER_ROLES.ADMIN);
    const { id } = await params;

    const result = await deleteAdminRedirect(user.id, id);

    if ('error' in result) {
      const err = result as unknown as { error: string; message: string };
      return NextResponse.json(
        { error: { code: err.error, message: err.message } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای داخلی سرور' } },
      { status: 500 }
    );
  }
}
