import { NextResponse } from 'next/server';
import { requireRole, authErrorResponse, AuthError } from '@/lib/auth/helpers';
import { USER_ROLES } from '@/types/enums';
import { getFeatureFlagInfo } from '@/modules/admin/service';

/**
 * GET /api/v1/admin/feature-flags — دریافت وضعیت فیچر فلگ‌ها
 * (فقط خواندنی — مقادیر از متغیرهای محیطی خوانده می‌شوند)
 */
export async function GET() {
  try {
    await requireRole(USER_ROLES.ADMIN);

    const result = await getFeatureFlagInfo();

    return NextResponse.json({ flags: result });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای داخلی سرور' } },
      { status: 500 }
    );
  }
}
