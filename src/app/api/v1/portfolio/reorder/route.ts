import { NextResponse } from 'next/server';
import { requireRole, authErrorResponse } from '@/lib/auth/helpers';
import { portfolioReorderSchema } from '@/lib/validators/portfolio';
import * as portfolioService from '@/modules/portfolio/service';
import { db } from '@/lib/db';

/**
 * POST /api/v1/portfolio/reorder — Reorder portfolio items
 */
export async function POST(request: Request) {
  try {
    const { user } = await requireRole('FREELANCER');

    const body = await request.json();
    const parsed = portfolioReorderSchema.safeParse(body);
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

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: { code: 'NO_PROFILE', message: 'پروفایل یافت نشد.' } },
        { status: 404 }
      );
    }

    const result = await portfolioService.reorderPortfolioItems(profile.id, parsed.data);

    if ('error' in result) {
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true } });
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
