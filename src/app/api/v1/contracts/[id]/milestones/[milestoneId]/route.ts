import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/helpers';
import { updateMilestoneStatus } from '@/modules/contracts/service';
import { updateMilestoneStatusSchema } from '@/lib/validators/contract';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });

  const { milestoneId } = await params;
  const body = await request.json();
  const data = updateMilestoneStatusSchema.parse(body);

  const result = await updateMilestoneStatus(milestoneId, auth.user.id, data);
  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : result.error === 'INVALID_TRANSITION' ? 409 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }

  return Response.json(result);
}