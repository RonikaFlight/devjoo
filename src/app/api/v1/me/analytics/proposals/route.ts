import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import { proposalAnalyticsFiltersSchema } from '@/lib/validators/analytics';
import * as proposalAnalytics from '@/modules/analytics/proposal-analytics';

/**
 * GET /api/v1/me/analytics/proposals — proposal analytics for current user
 * Works for both freelancers (sent proposals) and employers (received proposals)
 */
export async function GET(request: Request) {
  try {
    const { user } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const filters = proposalAnalyticsFiltersSchema.parse({
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });

    // Detect role: if user has EMPLOYER role, use employer analytics; otherwise freelancer
    const isEmployer = user.roles.some((r) => r.role.name === 'EMPLOYER');

    const result = isEmployer
      ? await proposalAnalytics.getEmployerProposalAnalytics(user.id, filters)
      : await proposalAnalytics.getFreelancerProposalAnalytics(user.id, filters);

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
