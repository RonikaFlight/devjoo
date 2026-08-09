import { NextResponse } from 'next/server';
import { requireRole, authErrorResponse } from '@/lib/auth/helpers';
import { portfolioUpdateSchema } from '@/lib/validators/portfolio';
import * as portfolioService from '@/modules/portfolio/service';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/portfolio/[id] — Update a portfolio item
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { user } = await requireRole('FREELANCER');
    const { id } = await params;

    const body = await request.json();
    const parsed = portfolioUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ورودی‌ها نامعتبر هستند.',
            details: parsed.error.errors.map((e) => e.message),
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

    const result = await portfolioService.updatePortfolioItem(id, profile.id, parsed.data);

    if ('error' in result) {
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: result.error === 'NOT_FOUND' ? 404 : 400 }
      );
    }

    return NextResponse.json({ data: result.item });
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
 * DELETE /api/v1/portfolio/[id] — Delete a portfolio item
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { user } = await requireRole('FREELANCER');
    const { id } = await params;

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

    const result = await portfolioService.deletePortfolioItem(id, profile.id);

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
