import { requireAuth, isFreelancer, isEmployer } from '@/lib/auth';
import { proposalSubmitSchema, proposalFiltersSchema } from '@/lib/validators/proposal';
import { listProjectProposals } from '@/modules/proposals/service';
import { submitProposal } from '@/modules/proposals/service';

/**
 * GET /api/v1/projects/[slug]/proposals — employer lists proposals for their project
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!isEmployer(auth.user)) {
      return Response.json(
        { error: { code: 'FORBIDDEN', message: 'فقط کارفرما می‌تواند پیشنهادها را ببیند.' } },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const parsed = proposalFiltersSchema.safeParse({
      status: searchParams.get('status') || undefined,
      sort: searchParams.get('sort') || 'newest',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    });
    if (!parsed.success) {
      return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'پارامترهای نامعتبر.' } }, { status: 400 });
    }

    const result = await listProjectProposals(slug, auth.user.id, parsed.data);
    if (result.error) {
      return Response.json({ error: { code: result.error, message: result.message } }, { status: 404 });
    }

    return Response.json({ data: result.proposals, meta: result.meta });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const e = error as { code: string; statusCode: number; message: string };
      return Response.json({ error: { code: e.code, message: e.message } }, { status: e.statusCode });
    }
    console.error('[Proposals GET Error]', error);
    return Response.json({ error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } }, { status: 500 });
  }
}

/**
 * POST /api/v1/projects/[slug]/proposals — freelancer submits proposal
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!isFreelancer(auth.user)) {
      return Response.json(
        { error: { code: 'FORBIDDEN', message: 'فقط فریلنسرها می‌توانند پیشنهاد ارسال کنند.' } },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const parsed = proposalSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'اطلاعات ورودی نامعتبر است.', details: parsed.error.issues.map((i) => i.message) } },
        { status: 400 }
      );
    }

    const result = await submitProposal(auth.user.id, slug, parsed.data);
    if (result.error) {
      const status = result.error === 'NOT_FOUND' ? 404 : result.error === 'PROPOSAL_LIMIT' ? 422 : 400;
      return Response.json({ error: { code: result.error, message: result.message } }, { status });
    }

    return Response.json({ data: result.proposal }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const e = error as { code: string; statusCode: number; message: string };
      return Response.json({ error: { code: e.code, message: e.message } }, { status: e.statusCode });
    }
    console.error('[Proposals POST Error]', error);
    return Response.json({ error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } }, { status: 500 });
  }
}
