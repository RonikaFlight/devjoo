import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/helpers';
import { listPayments } from '@/modules/payments/service';
import { paymentQuerySchema } from '@/lib/validators/payment';

export async function GET(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = paymentQuerySchema.parse(Object.fromEntries(searchParams));

  const result = await listPayments(auth.user.id, query);
  return Response.json(result);
}