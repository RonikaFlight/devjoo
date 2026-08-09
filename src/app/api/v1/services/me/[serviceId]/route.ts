import { NextRequest } from 'next/server';
import { getAuthUser, isFreelancer } from '@/lib/auth/helpers';
import { updateServiceListing, updateServiceListingStatus } from '@/modules/services/service';
import { updateServiceListingSchema, serviceListingStatusSchema } from '@/lib/validators/service';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ serviceId: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });
  if (!isFreelancer(auth.user)) return Response.json({ code: 'FORBIDDEN', message: 'فقط فریلنسرها' }, { status: 403 });

  const { serviceId } = await params;
  const body = await request.json();

  // Check if this is a status update
  if (body.status && ['PUBLISHED', 'PAUSED', 'ARCHIVED'].includes(body.status)) {
    const data = serviceListingStatusSchema.parse(body);
    const result = await updateServiceListingStatus(serviceId, auth.user.id, data);
    if ('error' in result) {
      const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : 400;
      return Response.json({ code: result.error, message: result.message }, { status });
    }
    return Response.json(result);
  }

  // Regular update
  const data = updateServiceListingSchema.parse(body);
  const result = await updateServiceListing(serviceId, auth.user.id, data);
  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }
  return Response.json(result);
}
