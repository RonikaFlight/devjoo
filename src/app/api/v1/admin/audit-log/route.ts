import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, authErrorResponse, AuthError } from '@/lib/auth/helpers';
import { USER_ROLES } from '@/types/enums';
import { listAuditLogs } from '@/modules/admin/service';
import { adminAuditLogListSchema } from '@/lib/validators/admin';

/**
 * GET /api/v1/admin/audit-log — لیست گزارش‌های حسابرسی
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(USER_ROLES.ADMIN);

    const searchParams = request.nextUrl.searchParams;

    const filters = adminAuditLogListSchema.parse({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') || undefined,
      resource: searchParams.get('resource') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
    });

    const result = await listAuditLogs(filters);

    return NextResponse.json({ logs: result.logs, meta: result.meta });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'پارامترهای ورودی نامعتبر هستند',
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
