import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const user = searchParams.get('user'); // wallet address
  const limit = searchParams.get('limit') || '50';

  if (!user) {
    return NextResponse.json({ error: 'user parameter required' }, { status: 400 });
  }

  try {
    const url = `https://data-api.polymarket.com/trades?user=${user}&limit=${limit}`;
    const response = await fetch(url, { 
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ trades: [] }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json({ trades: data }, {
      headers: { 'Cache-Control': 'public, s-maxage=30' },
    });
  } catch (error) {
    return NextResponse.json({ trades: [] }, { status: 200 });
  }
}