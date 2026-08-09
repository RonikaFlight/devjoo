import { NextResponse } from 'next/server';
import { requireAuth, requireRole, authErrorResponse } from '@/lib/auth/helpers';
import { portfolioCreateSchema } from '@/lib/validators/portfolio';
import * as portfolioService from '@/modules/portfolio/service';
import { db } from '@/lib/db';

/**
 * GET /api/v1/portfolio — List current freelancer's portfolio items
 */
export async function GET() {
  try {
    const { user } = await requireRole('FREELANCER');

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

    const items = await portfolioService.listPortfolioItems(profile.id);
    return NextResponse.json({ data: items });
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

/**
 * POST /api/v1/portfolio — Create a portfolio item
 */
export async function POST(request: Request) {
  try {
    const { user } = await requireRole('FREELANCER');

    const body = await request.json();
    const parsed = portfolioCreateSchema.safeParse(body);
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

    const result = await portfolioService.createPortfolioItem(profile.id, parsed.data);

    if ('error' in result) {
      const status = result.error === 'LIMIT_REACHED' ? 400 : 404;
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status }
      );
    }

    return NextResponse.json({ data: result.item }, { status: 201 });
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
