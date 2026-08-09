import { NextRequest } from 'next/server';
import { listServiceListings } from '@/modules/services/service';
import { serviceListingQuerySchema } from '@/lib/validators/service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = serviceListingQuerySchema.parse(Object.fromEntries(searchParams));

  const result = await listServiceListings(query);
  return Response.json(result);
}
