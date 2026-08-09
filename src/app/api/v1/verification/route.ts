import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import { verificationRequestSchema } from '@/lib/validators/verification';
import * as verificationService from '@/modules/verification/service';
import { db } from '@/lib/db';

/**
 * GET /api/v1/verification — List current user's verifications
 */
export async function GET() {
  try {
    const { user } = await requireAuth();

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

    // Check which role the user has to return the right verifications
    const isFreelancer = user.roles.some((r) => r.role.name === 'FREELANCER');
    const isEmployer = user.roles.some((r) => r.role.name === 'EMPLOYER');

    const [freelancerVerifications, employerVerifications] = await Promise.all([
      isFreelancer
        ? verificationService.listFreelancerVerifications(profile.id)
        : Promise.resolve([]),
      isEmployer
        ? verificationService.listEmployerVerifications(profile.id)
        : Promise.resolve([]),
    ]);

    // Get verification summary
    const primaryRole = isFreelancer ? 'freelancer' : isEmployer ? 'employer' : null;
    let summary = null;
    if (primaryRole) {
      summary = await verificationService.getVerificationSummary(
        profile.id,
        primaryRole
      );
    }

    return NextResponse.json({
      data: {
        freelancerVerifications,
        employerVerifications,
        summary,
      },
    });
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
 * POST /api/v1/verification — Request a new verification
 */
export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();

    const body = await request.json();
    const parsed = verificationRequestSchema.safeParse(body);
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

    const isFreelancer = user.roles.some((r) => r.role.name === 'FREELANCER');
    const isEmployer = user.roles.some((r) => r.role.name === 'EMPLOYER');

    let result;
    if (isFreelancer) {
      result = await verificationService.requestFreelancerVerification(profile.id, parsed.data);
    } else if (isEmployer) {
      result = await verificationService.requestEmployerVerification(profile.id, parsed.data);
    } else {
      return NextResponse.json(
        { error: { code: 'NO_ROLE', message: 'شما نقش فریلنسر یا کارفرما ندارید.' } },
        { status: 403 }
      );
    }

    if ('error' in result) {
      const statusMap: Record<string, number> = {
        ALREADY_VERIFIED: 409,
        PENDING_EXISTS: 409,
      };
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: statusMap[result.error] || 400 }
      );
    }

    return NextResponse.json({ data: result.verification }, { status: 201 });
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
