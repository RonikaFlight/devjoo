import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, authErrorResponse, AuthError } from '@/lib/auth/helpers';
import { USER_ROLES } from '@/types/enums';
import { listAdminUsers } from '@/modules/admin/service';
import { adminUserListSchema } from '@/lib/validators/admin';

/**
 * GET /api/v1/admin/users — list users with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(USER_ROLES.ADMIN);

    const searchParams = request.nextUrl.searchParams;

    const filters = adminUserListSchema.parse({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      isActive: searchParams.get('isActive') !== null
        ? searchParams.get('isActive') === 'true'
        : undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    const result = await listAdminUsers(filters);

    return NextResponse.json({ users: result.users, meta: result.meta });
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
