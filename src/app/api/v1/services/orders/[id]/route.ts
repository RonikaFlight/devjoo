import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/helpers';
import { updateServiceOrderStatus } from '@/modules/services/service';
import { updateServiceOrderStatusSchema } from '@/lib/validators/service';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const data = updateServiceOrderStatusSchema.parse(body);

  // Determine role
  const { db } = await import('@/lib/db');
  const order = await db.serviceOrder.findUnique({
    where: { id },
    include: { service: { select: { freelancerId: true } } },
  });
  if (!order) return Response.json({ code: 'NOT_FOUND', message: 'سفارش یافت نشد' }, { status: 404 });

  const role = order.service.freelancerId === auth.user.id ? 'freelancer' : 'employer';
  const result = await updateServiceOrderStatus(id, auth.user.id, role, data);

  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : result.error === 'INVALID_TRANSITION' ? 409 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }

  return Response.json(result);
}
