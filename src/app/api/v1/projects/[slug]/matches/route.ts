import { NextResponse } from 'next/server';
import { requireAuth, requireRole, authErrorResponse } from '@/lib/auth/helpers';
import * as matchingService from '@/modules/matching/service';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/v1/projects/[slug]/matches — get top freelancer matches for a project (employer)
 */
export async function GET(_request: Request, { params }: RouteParams) {
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

    const matches = await matchingService.getProjectMatches(project.id, 20);
    return NextResponse.json({ data: matches });
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
