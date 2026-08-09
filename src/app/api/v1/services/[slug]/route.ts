import { NextRequest } from 'next/server';
import { getServiceListing } from '@/modules/services/service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getServiceListing(slug);
  if ('error' in result) {
    return Response.json({ code: result.error, message: result.message }, { status: 404 });
  }
  return Response.json(result);
}