import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/helpers';
import { isFreelancer, isEmployer } from '@/lib/auth/helpers';
import { listContracts } from '@/modules/contracts/service';
import { contractQuerySchema } from '@/lib/validators/contract';

export async function GET(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = contractQuerySchema.parse(Object.fromEntries(searchParams));

  const role = isFreelancer(auth.user) ? 'freelancer' : 'employer';
  const result = await listContracts(auth.user.id, role, query);

  if ('error' in result) {
    const err = result as unknown as { error: string; message: string };
    return Response.json({ code: err.error, message: err.message }, { status: 400 });
  }

  return Response.json(result);
}