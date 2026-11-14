import { NextRequest, NextResponse } from 'next/server';
import { resolveEgyptianLandmarkImage } from '@/lib/egypt-image-pipeline';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const city = searchParams.get('city') || undefined;

  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const resolved = await resolveEgyptianLandmarkImage(query, city);
    return NextResponse.json(
      { url: resolved.url, source: resolved.source },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (err: any) {
    console.error('[fetch-image] Unexpected exception:', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
