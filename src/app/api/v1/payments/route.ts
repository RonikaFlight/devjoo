import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/helpers';
import { createPayment } from '@/modules/payments/service';
import { createPaymentSchema } from '@/lib/validators/payment';

export async function POST(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });

  const body = await request.json();
  const data = createPaymentSchema.parse(body);

  const result = await createPayment(auth.user.id, data);
  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }

  return Response.json(result, { status: 201 });
}
