import { NextResponse } from 'next/server';
import * as reviewsService from '@/modules/reviews/service';

/**
 * GET /api/v1/reviews/stats?profileId=xxx — Review statistics for a profile
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

    const stats = await reviewsService.getReviewStats(profileId);
    return NextResponse.json({ data: stats });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای سرور.' } },
      { status: 500 }
    );
  }
}
