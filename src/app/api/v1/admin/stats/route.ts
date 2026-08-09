import { NextRequest, NextResponse } from 'next/server';
import { requireRole, authErrorResponse, AuthError } from '@/lib/auth/helpers';
import { USER_ROLES } from '@/types/enums';
import { getAdminDashboardStats } from '@/modules/admin/service';

/**
 * GET /api/v1/admin/stats — admin dashboard statistics
 */
export async function GET(_request: NextRequest) {
  try {
    await requireRole(USER_ROLES.ADMIN);

    const stats = await getAdminDashboardStats();

    return NextResponse.json(stats);
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای داخلی سرور' } },
      { status: 500 }
    );
  }
}
