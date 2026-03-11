import { NextResponse } from 'next/server';
import { getSingularidades } from '@/lib/bolsadeaposta/getSingularidades';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date'); // YYYYMMDD
  const timezoneOffsetParam = searchParams.get('timezoneOffset');
  const timezoneOffset = timezoneOffsetParam ? parseInt(timezoneOffsetParam, 10) : new Date().getTimezoneOffset();
  
  let formattedDate = dateParam;

  if (!formattedDate) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    formattedDate = `${year}${month}${day}`;
  }

  // Expecting a heavy operation (can take ~5-15s based on the Match size)
  try {
     const matches = await getSingularidades(formattedDate, timezoneOffset);
     return NextResponse.json(matches || []);
  } catch (error) {
     console.error('API Error processing singularidades:', error);
     return NextResponse.json({ error: 'Failed to process singularidades' }, { status: 500 });
  }
}
