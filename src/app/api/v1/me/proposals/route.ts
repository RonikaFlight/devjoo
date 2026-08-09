import { requireAuth, isFreelancer } from '@/lib/auth';
import { listFreelancerProposals } from '@/modules/proposals/service';

/**
 * GET /api/v1/me/proposals — freelancer's submitted proposals
 */
export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if (!isFreelancer(auth.user)) {
      return Response.json(
        { error: { code: 'FORBIDDEN', message: 'فقط فریلنسرها دسترسی دارند.' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    const result = await listFreelancerProposals(auth.user.id, page, limit);
    return Response.json({ data: result.proposals, meta: result.meta });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const e = error as { code: string; statusCode: number; message: string };
      return Response.json({ error: { code: e.code, message: e.message } }, { status: e.statusCode });
    }
    console.error('[My Proposals Error]', error);
    return Response.json({ error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } }, { status: 500 });
  }
}