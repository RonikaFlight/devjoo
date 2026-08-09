import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import { projectAnalyticsFiltersSchema } from '@/lib/validators/analytics';
import * as projectAnalytics from '@/modules/analytics/project-analytics';

/**
 * GET /api/v1/me/analytics/projects — project analytics for current user (employer)
 */
export async function GET(request: Request) {
  try {
    const { user } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const filters = projectAnalyticsFiltersSchema.parse({
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });

    const result = await projectAnalytics.getEmployerProjectAnalytics(user.id, filters);
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return authErrorResponse(error as Parameters<typeof authErrorResponse>[0]);
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای سرور.' } },
      { status: 500 }
    );
  }
}
