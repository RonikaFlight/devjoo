import { requireAuth, isEmployer } from '@/lib/auth';
import { db } from '@/lib/db';
import { transitionProjectStatus } from '@/modules/projects/service';

/**
 * POST /api/v1/projects/[slug]/publish — publish a draft project
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!isEmployer(auth.user)) {
      return Response.json(
        { error: { code: 'FORBIDDEN', message: 'فقط کارفرماها می‌توانند پروژه منتشر کنند.' } },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const project = await db.project.findUnique({
      where: { slug },
      select: { id: true, employerId: true, status: true },
    });

    if (!project || project.employerId !== auth.user.id) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'پروژه یافت نشد.' } },
        { status: 404 }
      );
    }

    // Auto-approve in dev mode (skip PENDING_REVIEW)
    const targetStatus = process.env.NODE_ENV === 'production' ? 'PENDING_REVIEW' : 'PUBLISHED';
    // In dev, chain through intermediate statuses
    if (process.env.NODE_ENV !== 'production' && project.status === 'DRAFT') {
      const step1 = await transitionProjectStatus(project.id, auth.user.id, 'PENDING_REVIEW');
      if (step1.error) {
        return Response.json({ error: { code: step1.error, message: step1.message } }, { status: 400 });
      }
    }
    const result = await transitionProjectStatus(project.id, auth.user.id, targetStatus);

    if (result.error) {
      return Response.json(
        { error: { code: result.error, message: result.message } },
        { status: 400 }
      );
    }

    return Response.json({ data: result.project });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const e = error as { code: string; statusCode: number; message: string };
      return Response.json({ error: { code: e.code, message: e.message } }, { status: e.statusCode });
    }
    console.error('[Publish Error]', error);
    return Response.json({ error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } }, { status: 500 });
  }
}
