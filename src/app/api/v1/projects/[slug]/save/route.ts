import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { toggleSaveProject, getSavedProjects } from '@/modules/projects/service';

/**
 * POST /api/v1/projects/[slug]/save — toggle bookmark
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAuth();
    const { slug } = await params;

    const project = await db.project.findUnique({ where: { slug }, select: { id: true } });
    if (!project) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'پروژه یافت نشد.' } },
        { status: 404 }
      );
    }

    const result = await toggleSaveProject(auth.user.id, project.id);
    return Response.json({ data: { saved: result.saved } });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const e = error as { code: string; statusCode: number; message: string };
      return Response.json({ error: { code: e.code, message: e.message } }, { status: e.statusCode });
    }
    console.error('[Save Error]', error);
    return Response.json({ error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } }, { status: 500 });
  }
}
