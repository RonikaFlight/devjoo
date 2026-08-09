import { NextRequest } from 'next/server';
import { getAuthUser, isEmployer } from '@/lib/auth/helpers';
import { createServiceOrder } from '@/modules/services/service';
import { createServiceOrderSchema } from '@/lib/validators/service';

export async function POST(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });
  if (!isEmployer(auth.user)) return Response.json({ code: 'FORBIDDEN', message: 'فقط کارفرما می‌تواند سفارش ثبت کند' }, { status: 403 });

  const body = await request.json();
  const data = createServiceOrderSchema.parse(body);

  const result = await createServiceOrder(auth.user.id, data);
  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : result.error === 'INVALID_STATE' ? 409 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }

  return Response.json(result, { status: 201 });
}
