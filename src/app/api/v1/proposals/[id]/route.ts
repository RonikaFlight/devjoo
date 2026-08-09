import { requireAuth, isEmployer } from '@/lib/auth';
import { proposalStatusSchema } from '@/lib/validators/proposal';
import { updateProposalStatus } from '@/modules/proposals/service';

/**
 * PATCH /api/v1/proposals/[id] — employer updates proposal status
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!isEmployer(auth.user)) {
      return Response.json(
        { error: { code: 'FORBIDDEN', message: 'فقط کارفرما می‌تواند وضعیت پیشنهاد را تغییر دهد.' } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = proposalStatusSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'اطلاعات ورودی نامعتبر است.', details: parsed.error.issues.map((i) => i.message) } },
        { status: 400 }
      );
    }

    const result = await updateProposalStatus(id, auth.user.id, parsed.data.status, parsed.data.rejectionReason);
    if (result.error) {
      return Response.json({ error: { code: result.error, message: result.message } }, { status: 404 });
    }

    return Response.json({ data: { success: true } });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const e = error as { code: string; statusCode: number; message: string };
      return Response.json({ error: { code: e.code, message: e.message } }, { status: e.statusCode });
    }
    console.error('[Proposal PATCH Error]', error);
    return Response.json({ error: { code: 'INTERNAL_ERROR', message: 'خطای داخلی سرور.' } }, { status: 500 });
  }
}
