import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, authErrorResponse, AuthError } from '@/lib/auth/helpers';
import { USER_ROLES } from '@/types/enums';
import { listAdminVerifications } from '@/modules/admin/service';
import { adminVerificationListSchema } from '@/lib/validators/admin';

/**
 * GET /api/v1/admin/verifications — list verifications with filters
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(USER_ROLES.ADMIN);

    const searchParams = request.nextUrl.searchParams;

    const filters = adminVerificationListSchema.parse({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      role: searchParams.get('role') || undefined,
    });

    const result = await listAdminVerifications(filters);

    return NextResponse.json({ verifications: result.verifications });
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
