import { NextRequest, NextResponse } from 'next/server';

interface LeaderboardTrader {
  proxyWallet: string;
  totalProfitLoss: number;
  totalVolume: number;
  rank?: number;
}

interface WhaleTrade {
  proxyWallet: string;
  side: 'BUY' | 'SELL';
  title: string;
  outcome: string;
  size: number;
  price: number;
  timestamp: number;
  pseudonym?: string;
  profileImage?: string;
  transactionHash: string;
}

interface EnrichedTrade extends WhaleTrade {
  traderProfit?: number;
  traderVolume?: number;
  traderRank?: number;
}

// Cache leaderboard data for 5 minutes
let leaderboardCache: { data: Map<string, LeaderboardTrader>; timestamp: number } | null = null;
const LEADERBOARD_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchLeaderboard(): Promise<Map<string, LeaderboardTrader>> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (leaderboardCache && (now - leaderboardCache.timestamp) < LEADERBOARD_CACHE_DURATION) {
    console.log('Using cached leaderboard data');
    return leaderboardCache.data;
  }

  try {
    console.log('Fetching fresh leaderboard data');
    const response = await fetch('https://data-api.polymarket.com/leaderboard?limit=100', {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`Leaderboard API error: ${response.status}`);
      return new Map();
    }

    const leaderboard: LeaderboardTrader[] = await response.json();
    const traderMap = new Map<string, LeaderboardTrader>();
    
    leaderboard.forEach((trader, index) => {
      traderMap.set(trader.proxyWallet.toLowerCase(), {
        ...trader,
        rank: index + 1,
      });
    });

    // Update cache
    leaderboardCache = {
      data: traderMap,
      timestamp: now,
    };

    console.log(`Loaded ${traderMap.size} traders from leaderboard`);
    return traderMap;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return new Map();
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const minAmount = searchParams.get('minAmount') || '5000';
  const minProfit = searchParams.get('minProfit') || '0';
  const limit = searchParams.get('limit') || '50';
  const onlyTop100 = searchParams.get('onlyTop100') === 'true';

  try {
    // Fetch leaderboard data
    const leaderboardMap = await fetchLeaderboard();

    // Fetch whale trades
    const url = `https://data-api.polymarket.com/trades?filterType=CASH&filterAmount=${minAmount}&limit=${limit}&takerOnly=false`;
    
    console.log('Fetching whale trades:', url);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Polymarket whale trades API error: ${response.status}`);
      return NextResponse.json({ 
        trades: [],
        stats: { totalVolume: 0, buyVolume: 0, sellVolume: 0, uniqueWhales: 0, profitableTraders: 0 }
      }, { status: 200 });
    }

    const rawTrades: WhaleTrade[] = await response.json();
    
    // Enrich trades with trader data
    const enrichedTrades: EnrichedTrade[] = rawTrades.map(trade => {
      const traderData = leaderboardMap.get(trade.proxyWallet.toLowerCase());
      
      return {
        ...trade,
        traderProfit: traderData?.totalProfitLoss,
        traderVolume: traderData?.totalVolume,
        traderRank: traderData?.rank,
      };
    });

    // Filter by minimum profit
    const minProfitNum = parseFloat(minProfit);
    let filteredTrades = enrichedTrades;
    
    if (onlyTop100) {
      filteredTrades = enrichedTrades.filter(t => t.traderRank !== undefined && t.traderRank <= 100);
    } else if (minProfitNum > 0) {
      filteredTrades = enrichedTrades.filter(t => 
        t.traderProfit !== undefined && t.traderProfit >= minProfitNum
      );
    }

    // Sort: profitable traders first, then by trade size
    filteredTrades.sort((a, b) => {
      // Top 100 traders first
      if (a.traderRank && !b.traderRank) return -1;
      if (!a.traderRank && b.traderRank) return 1;
      
      // Among top traders, sort by rank
      if (a.traderRank && b.traderRank) {
        return a.traderRank - b.traderRank;
      }
      
      // Otherwise sort by trade size
      return b.size - a.size;
    });

    // Calculate stats
    const stats = {
      totalVolume: filteredTrades.reduce((sum, t) => sum + t.size, 0),
      buyVolume: filteredTrades.filter(t => t.side === 'BUY').reduce((sum, t) => sum + t.size, 0),
      sellVolume: filteredTrades.filter(t => t.side === 'SELL').reduce((sum, t) => sum + t.size, 0),
      uniqueWhales: new Set(filteredTrades.map(t => t.proxyWallet)).size,
      profitableTraders: filteredTrades.filter(t => t.traderProfit && t.traderProfit > 0).length,
    };
    
    console.log(`Returning ${filteredTrades.length} trades (${stats.profitableTraders} from profitable traders)`);
    
    return NextResponse.json({ trades: filteredTrades, stats }, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20' },
    });
  } catch (error) {
    console.error('Polymarket whale trades API error:', error);
    return NextResponse.json({ 
      trades: [],
      stats: { totalVolume: 0, buyVolume: 0, sellVolume: 0, uniqueWhales: 0, profitableTraders: 0 }
    }, { status: 200 });
  }
}