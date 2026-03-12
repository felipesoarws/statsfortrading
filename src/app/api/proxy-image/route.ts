import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
    });

    if (!response.ok) {
      console.error(`[ProxyImage] Failed to fetch image from ${url}: ${response.status}`);
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24h
      },
    });
  } catch (error) {
    console.error(`[ProxyImage] Error fetching image from ${url}:`, error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
