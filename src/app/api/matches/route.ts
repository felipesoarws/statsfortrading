import { NextResponse } from 'next/server';
import { getMatchesOfDay } from '@/lib/flashscore/getMatchesOfDay';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date'); // YYYYMMDD
  
  let formattedDate = dateParam;

  if (!formattedDate) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    formattedDate = `${year}${month}${day}`;
  }

  const matches = await getMatchesOfDay(formattedDate);

  return NextResponse.json(matches || []);
}
