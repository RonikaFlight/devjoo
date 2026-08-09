import { requireAuth, getAuthUser } from '@/lib/auth';
import { projectUpdateSchema } from '@/lib/validators/project';
import { getProjectBySlug, updateProject } from '@/modules/projects/service';

/**
 * GET /api/v1/projects/[slug] — public project detail
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await getAuthUser();
    const project = await getProjectBySlug(slug, auth?.user?.id);

    if (!project) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'پروژه یافت نشد.' } },
        { status: 404 }
      );
    }

    return Response.json({ data: project });
  } catch (error) {
    console.error('[Project GET Error]', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/projects/[slug] — update draft project (employer)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAuth();
    const { slug } = await params;

    const body = await request.json();
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'اطلاعات ورودی نامعتبر است.', details: parsed.error.issues.map((i) => i.message) } },
        { status: 400 }
      );
    }

    // Find project by slug to get ID
    const { db } = await import('@/lib/db');
    const project = await db.project.findUnique({ where: { slug }, select: { id: true } });
    if (!project) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'پروژه یافت نشد.' } },
        { status: 404 }
      );
    }

    const result = await updateProject(project.id, auth.user.id, parsed.data);
    if (result.error) {
      const status = result.error === 'NOT_FOUND' ? 404 : 403;
      return Response.json({ error: { code: result.error, message: result.message } }, { status });
    }

    return Response.json({ data: result.project });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const e = error as { code: string; statusCode: number; message: string };
      return Response.json({ error: { code: e.code, message: e.message } }, { status: e.statusCode });
    }
    console.error('[Project PATCH Error]', error);
    return Response.json({ error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } }, { status: 500 });
  }
}
