import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import { reviewCreateSchema, reviewFiltersSchema } from '@/lib/validators/review';
import * as reviewsService from '@/modules/reviews/service';
import { db } from '@/lib/db';

/**
 * GET /api/v1/reviews?profileId=xxx — List reviews received by a profile
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'شناسه پروفایل الزامی است.' } },
        { status: 400 }
      );
    }

    const filters = reviewFiltersSchema.parse({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    });

    const result = await reviewsService.listReceivedReviews(profileId, filters);
    return NextResponse.json({
      data: result.reviews,
      meta: result.meta,
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای سرور.' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/reviews — Create a review for a completed project
 */
export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();

    const body = await request.json();
    const parsed = reviewCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ورودی‌ها نامعتبر هستند.',
            details: parsed.error.issues.map((e) => e.message),
          },
        },
        { status: 400 }
      );
    }

    const result = await reviewsService.createReview(user.id, parsed.data);

    if ('error' in result) {
      const statusMap: Record<string, number> = {
        NOT_FOUND: 404,
        PROJECT_NOT_COMPLETED: 400,
        NO_FREELANCER: 400,
        ALREADY_REVIEWED: 409,
        NOT_PARTICIPANT: 403,
      };
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: statusMap[result.error!] || 400 }
      );
    }

    return NextResponse.json({ data: result.review }, { status: 201 });
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
