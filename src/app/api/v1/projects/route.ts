import { requireAuth, isEmployer } from '@/lib/auth';
import { projectCreateSchema, projectFiltersSchema } from '@/lib/validators/project';
import { createProject, listProjects } from '@/modules/projects/service';

/**
 * GET /api/v1/projects — public, published projects list
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = projectFiltersSchema.safeParse({
      categoryId: searchParams.get('categoryId') || undefined,
      skills: searchParams.get('skills')?.split(',').filter(Boolean) || undefined,
      budgetType: searchParams.get('budgetType') || undefined,
      experienceLevel: searchParams.get('experienceLevel') || undefined,
      workType: searchParams.get('workType') || undefined,
      minBudget: searchParams.get('minBudget') ? Number(searchParams.get('minBudget')) : undefined,
      maxBudget: searchParams.get('maxBudget') ? Number(searchParams.get('maxBudget')) : undefined,
      city: searchParams.get('city') || undefined,
      sort: searchParams.get('sort') || 'newest',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      search: searchParams.get('search') || undefined,
    });

    if (!parsed.success) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'پارامترهای نامعتبر.', details: parsed.error.issues.map((i) => i.message) } },
        { status: 400 }
      );
    }

    const result = await listProjects(parsed.data);
    return Response.json({ data: result.projects, meta: result.meta });
  } catch (error) {
    console.error('[Projects GET Error]', error);
    return Response.json({ error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } }, { status: 500 });
  }
}

/**
 * POST /api/v1/projects — create a new project (employer only)
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (!isEmployer(auth.user)) {
      return Response.json(
        { error: { code: 'FORBIDDEN', message: 'فقط کارفرماها می‌توانند پروژه ثبت کنند.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = projectCreateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'اطلاعات ورودی نامعتبر است.', details: parsed.error.issues.map((i) => i.message) } },
        { status: 400 }
      );
    }

    const project = await createProject(auth.user.id, parsed.data);
    return Response.json({ data: project }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const e = error as { code: string; statusCode: number; message: string };
      return Response.json({ error: { code: e.code, message: e.message } }, { status: e.statusCode });
    }
    console.error('[Projects POST Error]', error);
    return Response.json({ error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } }, { status: 500 });
  }
}
