import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const minAmount = searchParams.get('minAmount') || '5000';
  const limit = searchParams.get('limit') || '50';

  try {
    const url = `https://data-api.polymarket.com/trades?filterType=CASH&filterAmount=${minAmount}&limit=${limit}&takerOnly=false`;
    
    console.log('Fetching whale trades:', url);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Polymarket whale trades API error: ${response.status}`);
      return NextResponse.json({ trades: [] }, { status: 200 });
    }

    const data = await response.json();
    console.log(`Returned ${data?.length || 0} whale trades`);
    
    return NextResponse.json({ trades: data }, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20' },
    });
  } catch (error) {
    console.error('Polymarket whale trades API error:', error);
    return NextResponse.json({ trades: [] }, { status: 200 });
  }
}