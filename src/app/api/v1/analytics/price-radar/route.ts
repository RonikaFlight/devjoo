import { NextResponse } from 'next/server';
import { priceRadarFiltersSchema } from '@/lib/validators/analytics';
import * as priceRadar from '@/modules/analytics/price-radar';

/**
 * GET /api/v1/analytics/price-radar — market price intelligence (public)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = priceRadarFiltersSchema.parse({
      categoryId: searchParams.get('categoryId') || undefined,
    });

    const result = await priceRadar.getPriceRadar(filters);
    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'خطای سرور.' } },
      { status: 500 }
    );
  }
}
