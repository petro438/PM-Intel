import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'OVERALL';
  const timePeriod = searchParams.get('timePeriod') || 'DAY';
  const orderBy = searchParams.get('orderBy') || 'PNL';
  const limit = searchParams.get('limit') || '50';

  try {
    const url = `https://data-api.polymarket.com/v1/leaderboard?category=${category}&timePeriod=${timePeriod}&orderBy=${orderBy}&limit=${limit}`;
    
    console.log('Fetching Polymarket leaderboard:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Polymarket leaderboard API error: ${response.status}`, errorText);
      return NextResponse.json({ 
        traders: [],
        error: `Polymarket API returned ${response.status}`
      }, { status: 200 });
    }

    const data = await response.json();
    console.log(`Polymarket returned ${data?.length || 0} traders`);
    
    return NextResponse.json({ traders: data }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Polymarket leaderboard API error:', error);
    return NextResponse.json({ 
      traders: [],
      error: String(error)
    }, { status: 200 });
  }
}
