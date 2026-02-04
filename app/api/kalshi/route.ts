import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || '200';
  const status = searchParams.get('status') || 'open';
  const minLiquidity = searchParams.get('min_liquidity') || '500'; // Filter at API level

  try {
    // Use cursor-based pagination to scan more markets
    let allMarkets: any[] = [];
    let cursor: string | null = null;
    let fetchCount = 0;
    const maxFetches = 5; // Fetch up to 5 pages (1000 markets total)

    while (fetchCount < maxFetches) {
      // Build URL with filters
      let url = `https://api.elections.kalshi.com/trade-api/v2/markets?limit=200&status=${status}`;
      
      // Add cursor for pagination
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (process.env.KALSHI_API_KEY) {
        headers['Authorization'] = process.env.KALSHI_API_KEY;
      }

      console.log(`Fetching batch ${fetchCount + 1} from Kalshi...`);

      const response = await fetch(url, {
        headers,
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Kalshi API error: ${response.status}`, errorText);
        break;
      }

      const data = await response.json();
      
      if (data.markets && Array.isArray(data.markets)) {
        // Filter by minimum liquidity at API level
        const filteredMarkets = data.markets.filter((m: any) => {
          const openInterest = m.open_interest || 0;
          return openInterest >= parseInt(minLiquidity);
        });
        
        allMarkets = allMarkets.concat(filteredMarkets);
        console.log(`Batch ${fetchCount + 1}: Found ${filteredMarkets.length} markets with liquidity >= ${minLiquidity}`);
      }

      // Check if there's more data
      cursor = data.cursor || null;
      fetchCount++;
      
      // Stop if no more pages
      if (!cursor) break;
      
      // Stop if we have enough quality markets
      if (allMarkets.length >= 500) break;
    }
    
    console.log(`Total quality markets found: ${allMarkets.length} (scanned ${fetchCount * 200} markets)`);
    
    return NextResponse.json({ 
      markets: allMarkets,
      total_scanned: fetchCount * 200,
      total_returned: allMarkets.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Kalshi API error:', error);
    return NextResponse.json({ 
      markets: [],
      error: String(error)
    }, { status: 200 });
  }
}
