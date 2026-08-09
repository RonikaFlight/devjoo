import { NextRequest } from 'next/server';
import { listTeams } from '@/modules/teams/service';
import { teamQuerySchema } from '@/lib/validators/team';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = teamQuerySchema.parse(Object.fromEntries(searchParams));

  const result = await listTeams(query);
  return Response.json(result);
}