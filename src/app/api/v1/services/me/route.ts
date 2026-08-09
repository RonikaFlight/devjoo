import { NextRequest } from 'next/server';
import { getAuthUser, isFreelancer } from '@/lib/auth/helpers';
import { createServiceListing, listMyServiceListings } from '@/modules/services/service';
import { createServiceListingSchema } from '@/lib/validators/service';

export async function GET(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });
  if (!isFreelancer(auth.user)) return Response.json({ code: 'FORBIDDEN', message: 'فقط فریلنسرها' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;

  const result = await listMyServiceListings(auth.user.id, status);
  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ code: 'UNAUTHORIZED', message: 'لطفا وارد شوید' }, { status: 401 });
  if (!isFreelancer(auth.user)) return Response.json({ code: 'FORBIDDEN', message: 'فقط فریلنسرها می‌توانند سرویس ایجاد کنند' }, { status: 403 });

  const body = await request.json();
  const data = createServiceListingSchema.parse(body);

  const result = await createServiceListing(auth.user.id, data);
  if ('error' in result) {
    const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : 400;
    return Response.json({ code: result.error, message: result.message }, { status });
  }

  return Response.json(result, { status: 201 });
}