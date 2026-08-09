import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/helpers';
import { getPayment } from '@/modules/payments/service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });

  const { id } = await params;
  const result = await getPayment(id, auth.user.id);
  if ('error' in result) {
    return Response.json({ code: result.error, message: result.message }, { status: 404 });
  }
  return Response.json(result);
}