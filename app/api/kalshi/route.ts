import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || '50';
  const status = searchParams.get('status') || 'open';

  try {
    const url = `https://trading-api.kalshi.com/trade-api/v2/markets?limit=${limit}&status=${status}`;
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // Add auth if API keys are configured
    if (process.env.KALSHI_API_KEY && process.env.KALSHI_API_SECRET) {
      // For authenticated requests, you'd need to implement Kalshi's auth flow
      // This is a placeholder for now
      headers['Authorization'] = `Bearer ${process.env.KALSHI_API_KEY}`;
    }

    const response = await fetch(url, {
      headers,
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      console.error(`Kalshi API error: ${response.status} ${response.statusText}`);
      // Return empty markets array on error so app doesn't break
      return NextResponse.json({ markets: [] }, { status: 200 });
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Kalshi API error:', error);
    // Return empty markets array instead of error
    return NextResponse.json({ markets: [] }, { status: 200 });
  }
}
