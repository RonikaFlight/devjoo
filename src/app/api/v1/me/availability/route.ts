import { NextResponse } from 'next/server';
import { requireAuth, requireRole, authErrorResponse } from '@/lib/auth/helpers';
import { availabilityUpdateSchema } from '@/lib/validators/availability';
import { db } from '@/lib/db';

/**
 * GET /api/v1/me/availability — get freelancer availability
 */
export async function GET() {
  try {
    const { user } = await requireRole('FREELANCER');

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        freelancerProfile: {
          select: { availability: true, hoursPerWeek: true, availableFrom: true },
        },
      },
    });

    if (!profile?.freelancerProfile) {
      return NextResponse.json(
        { error: { code: 'NO_PROFILE', message: 'پروفایل فریلنسر یافت نشد.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: profile.freelancerProfile });
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
 * PATCH /api/v1/me/availability — update freelancer availability
 */
export async function PATCH(request: Request) {
  try {
    const { user } = await requireRole('FREELANCER');

    const body = await request.json();
    const parsed = availabilityUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ورودی‌ها نامعتبر هستند.', details: parsed.error.errors.map((e) => e.message) } },
        { status: 400 }
      );
    }

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { freelancerProfile: { select: { id: true } } },
    });

    if (!profile?.freelancerProfile) {
      return NextResponse.json(
        { error: { code: 'NO_PROFILE', message: 'پروفایل فریلنسر یافت نشد.' } },
        { status: 404 }
      );
    }

    const updated = await db.freelancerProfile.update({
      where: { id: profile.freelancerProfile.id },
      data: {
        availability: parsed.data.availability,
        hoursPerWeek: parsed.data.hoursPerWeek,
        availableFrom: parsed.data.availableFrom ? new Date(parsed.data.availableFrom) : undefined,
      },
    });

    return NextResponse.json({ data: updated });
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
