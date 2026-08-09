import { NextRequest } from 'next/server';
import { getAuthUser, isFreelancer } from '@/lib/auth/helpers';
import { createTeam, listMyTeams } from '@/modules/teams/service';
import { createTeamSchema } from '@/lib/validators/team';

export async function GET(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });
  if (!isFreelancer(auth.user)) return Response.json({ code: 'FORBIDDEN', message: 'فقط فریلنسرها' }, { status: 403 });

  const result = await listMyTeams(auth.user.id);
  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });
  if (!isFreelancer(auth.user)) return Response.json({ code: 'FORBIDDEN', message: 'فقط فریلنسرها می‌توانند تیم ایجاد کنند' }, { status: 403 });

  const body = await request.json();
  const data = createTeamSchema.parse(body);

  const result = await createTeam(auth.user.id, data);
  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'LIMIT_EXCEEDED' ? 429 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }

  return Response.json(result, { status: 201 });
}
