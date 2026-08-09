import { NextResponse } from 'next/server';
import * as reputationService from '@/modules/reputation/service';

/**
 * GET /api/v1/reputation?userId=xxx — Get reputation summary for a user
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'client' or 'freelancer'

    if (!userId || !type) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'شناسه کاربر و نوع الزامی هستند.' } },
        { status: 400 }
      );
    }

    if (type === 'client') {
      const [metrics, score] = await Promise.all([
        reputationService.getClientScore(userId),
        reputationService.computeClientScore(userId),
      ]);
      return NextResponse.json({
        data: {
          ...metrics,
          score,
        },
      });
    } else if (type === 'freelancer') {
      const [reputation, score] = await Promise.all([
        reputationService.getFreelancerReputation(userId),
        reputationService.computeReputationScore(userId),
      ]);
      return NextResponse.json({
        data: {
          ...reputation,
          score,
        },
      });
    } else {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'نوع باید client یا freelancer باشد.' } },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای سرور.' } },
      { status: 500 }
    );
  }
}
