import { NextResponse } from 'next/server';
import { requireAuth, requireRole, authErrorResponse } from '@/lib/auth/helpers';
import { invitationCreateSchema, invitationFiltersSchema } from '@/lib/validators/invitation';
import * as invitationService from '@/modules/invitations/service';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/v1/projects/[slug]/invitations — list project invitations (employer)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { user } = await requireRole('EMPLOYER');
    const { slug } = await params;

    const project = await db.project.findUnique({
      where: { slug },
      select: { id: true, employerId: true },
    });

    if (!project || project.employerId !== user.id) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'پروژه یافت نشد.' } },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = invitationFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    });

    const result = await invitationService.listProjectInvitations(project.id, user.id, filters);
    if ('error' in result) {
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: 404 }
      );
    }

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
 * POST /api/v1/projects/[slug]/invitations — create invitation (employer)
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { user } = await requireRole('EMPLOYER');
    const { slug } = await params;

    const project = await db.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'پروژه یافت نشد.' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = invitationCreateSchema.safeParse({
      ...body,
      projectId: project.id,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ورودی‌ها نامعتبر هستند.', details: parsed.error.errors.map((e) => e.message) } },
        { status: 400 }
      );
    }

    const result = await invitationService.createInvitation(user.id, parsed.data);

    if ('error' in result) {
      const statusMap: Record<string, number> = {
        NOT_FOUND: 404,
        FORBIDDEN: 403,
        PROJECT_NOT_OPEN: 400,
        SELF_INVITE: 400,
        ALREADY_INVITED: 409,
        ALREADY_ACCEPTED: 409,
        ALREADY_PROPOSED: 409,
      };
      return NextResponse.json(
        { error: { code: result.error, message: result.message } },
        { status: statusMap[result.error] || 400 }
      );
    }

    return NextResponse.json({ data: result.invitation }, { status: 201 });
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
