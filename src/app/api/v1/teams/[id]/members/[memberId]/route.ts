import { NextRequest } from 'next/server';
import { getAuthUser, isFreelancer } from '@/lib/auth/helpers';
import { removeTeamMember, updateTeamMemberRole } from '@/modules/teams/service';
import { updateTeamMemberRoleSchema } from '@/lib/validators/team';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });
  if (!isFreelancer(auth.user)) return Response.json({ code: 'FORBIDDEN', message: 'فقط فریلنسرها' }, { status: 403 });

  const { id, memberId } = await params;
  const body = await request.json();
  const data = updateTeamMemberRoleSchema.parse(body);

  const result = await updateTeamMemberRole(id, memberId, auth.user.id, data);
  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }
  return Response.json(result);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });
  if (!isFreelancer(auth.user)) return Response.json({ code: 'FORBIDDEN', message: 'فقط فریلنسرها' }, { status: 403 });

  const { id, memberId } = await params;
  const result = await removeTeamMember(id, memberId, auth.user.id);
  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }
  return Response.json(result);
}