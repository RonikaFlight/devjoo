import { NextResponse } from 'next/server';
import { requireAuth, requireRole, authErrorResponse } from '@/lib/auth/helpers';
import { projectFiltersSchema } from '@/lib/validators/project';
import * as feedService from '@/modules/feed/service';

/**
 * GET /api/v1/feed — personalized project feed for freelancers
 */
export async function GET(request: Request) {
  try {
    const { user } = await requireRole('FREELANCER');

    const { searchParams } = new URL(request.url);
    const filters = projectFiltersSchema.parse({
      categoryId: searchParams.get('categoryId') || undefined,
      budgetType: searchParams.get('budgetType') || undefined,
      experienceLevel: searchParams.get('experienceLevel') || undefined,
      workType: searchParams.get('workType') || undefined,
      city: searchParams.get('city') || undefined,
      minBudget: searchParams.get('minBudget') ? Number(searchParams.get('minBudget')) : undefined,
      maxBudget: searchParams.get('maxBudget') ? Number(searchParams.get('maxBudget')) : undefined,
      skills: searchParams.get('skills') ? searchParams.get('skills')!.split(',') : undefined,
      sort: searchParams.get('sort') || 'newest',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      search: searchParams.get('search') || undefined,
    });

    const result = await feedService.getSmartFeed(user.id, filters);
    return NextResponse.json({ data: result.feed, meta: result.meta });
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
