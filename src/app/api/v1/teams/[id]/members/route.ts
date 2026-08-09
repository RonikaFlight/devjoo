import { NextRequest } from 'next/server';
import { getAuthUser, isFreelancer } from '@/lib/auth/helpers';
import { addTeamMember } from '@/modules/teams/service';
import { addTeamMemberSchema } from '@/lib/validators/team';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });
  if (!isFreelancer(auth.user)) return Response.json({ code: 'FORBIDDEN', message: 'فقط فریلنسرها' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const data = addTeamMemberSchema.parse(body);

  const result = await addTeamMember(id, auth.user.id, data);
  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : result.error === 'LIMIT_EXCEEDED' ? 429 : result.error === 'CONFLICT' ? 409 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }

  return Response.json(result, { status: 201 });
}