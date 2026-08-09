import { NextResponse } from 'next/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/helpers';
import { invitationFiltersSchema, invitationRespondSchema } from '@/lib/validators/invitation';
import * as invitationService from '@/modules/invitations/service';

/**
 * GET /api/v1/me/invitations — list freelancer's received invitations
 */
export async function GET(request: Request) {
  try {
    const { user } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const filters = invitationFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    });

    const result = await invitationService.listFreelancerInvitations(user.id, filters);
    return NextResponse.json({ data: result.invitations, meta: result.meta });
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
 * PATCH /api/v1/me/invitations — respond to an invitation (freelancer)
 */
export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuth();

    const body = await request.json();
    const parsed = invitationRespondSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ورودی‌ها نامعتبر هستند.', details: parsed.error.issues.map((e) => e.message) } },
        { status: 400 }
      );
    }

    // invitationId must be in body
    const { invitationId } = body as { invitationId: string };
    if (!invitationId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'شناسه دعوت‌نامه الزامی است.' } },
        { status: 400 }
      );
    }

    const result = await invitationService.respondToInvitation(invitationId, user.id, parsed.data);

    if ('error' in result) {
      const statusMap: Record<string, number> = {
        NOT_FOUND: 404,
        FORBIDDEN: 403,
        NOT_PENDING: 400,
      };
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: statusMap[result.error!] || 400 }
      );
    }

    return NextResponse.json({ data: result.invitation });
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
