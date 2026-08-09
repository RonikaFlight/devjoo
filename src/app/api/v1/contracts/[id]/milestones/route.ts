import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/helpers';
import { addMilestone } from '@/modules/contracts/service';
import { createMilestoneSchema } from '@/lib/validators/contract';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const data = createMilestoneSchema.parse(body);

  const result = await addMilestone(id, auth.user.id, data);
  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : result.error === 'INVALID_STATE' ? 409 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }

  return Response.json(result, { status: 201 });
}