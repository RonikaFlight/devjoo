import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/helpers';
import { getTeam, updateTeam } from '@/modules/teams/service';
import { updateTeamSchema } from '@/lib/validators/team';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getTeam(id);
  if ('error' in result) {
    return Response.json({ code: result.error, message: result.message }, { status: 404 });
  }
  return Response.json(result);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const data = updateTeamSchema.parse(body);

  const result = await updateTeam(id, auth.user.id, data);
  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }
  return Response.json(result);
}