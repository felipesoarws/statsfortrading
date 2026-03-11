import { NextResponse } from 'next/server';
import { getMatchDetails } from '@/lib/flashscore/getMatchDetails';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const p = await params;
  const matchId = p.id;

  if (!matchId) {
    return NextResponse.json({ error: 'Missing match ID.' }, { status: 400 });
  }

  const details = await getMatchDetails(matchId);

  if (!details) {
    return NextResponse.json({ error: 'Match details not found.' }, { status: 404 });
  }

  return NextResponse.json(details);
}
