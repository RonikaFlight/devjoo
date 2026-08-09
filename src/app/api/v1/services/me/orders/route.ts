import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/helpers';
import { listServiceOrders } from '@/modules/services/service';
import { serviceOrderQuerySchema } from '@/lib/validators/service';

export async function GET(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = serviceOrderQuerySchema.parse(Object.fromEntries(searchParams));

  // Determine role based on query param or check both
  const roleParam = searchParams.get('as');
  const role = roleParam === 'freelancer' ? 'freelancer' : 'employer';

  const result = await listServiceOrders(auth.user.id, role, query);
  return Response.json(result);
}
