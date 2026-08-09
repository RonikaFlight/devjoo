import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/helpers';
import { isEmployer } from '@/lib/auth/helpers';
import { createContract } from '@/modules/contracts/service';
import { createContractSchema } from '@/lib/validators/contract';

export async function POST(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });
  if (!isEmployer(auth.user)) return Response.json({ code: 'FORBIDDEN', message: 'فقط کارفرما می‌تواند قرارداد ایجاد کند' }, { status: 403 });

  const body = await request.json();
  const data = createContractSchema.parse(body);

  // Get freelancerId from the accepted proposal's project
  const { db } = await import('@/lib/db');
  const proposal = await db.proposal.findFirst({
    where: { projectId: data.projectId, status: 'ACCEPTED' },
    select: { freelancerId: true },
  });
  if (!proposal) {
    return Response.json({ code: 'NOT_FOUND', message: 'پیشنهاد تایید شده‌ای یافت نشد' }, { status: 404 });
  }

  const result = await createContract(proposal.freelancerId, auth.user.id, data);
  if ('error' in result) {
    const status = result.error === 'NOT_FOUND' ? 404 : result.error === 'FORBIDDEN' ? 403 : result.error === 'CONFLICT' ? 409 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }

  return Response.json(result, { status: 201 });
}
