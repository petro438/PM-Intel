'use client';

import { useEffect, useState } from 'react';

interface Market {
  platform: string;
  title: string;
  price: number;
  volume: number;
  liquidity: number;
  trades: number;
  category: string;
  velocity: number;
  priceChange: number;
}

export default function ActivityMonitor({ filters }: { filters: any }) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'velocity' | 'priceChange' | 'liquidity' | 'volume'>('velocity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadMarkets();
  }, [filters]);

  async function loadMarkets() {
    setLoading(true);
    try {
      // Fetch way more markets - Kalshi has 1000+
      const response = await fetch('/api/kalshi?limit=1000');
      const data = await response.json();
      
      console.log('Kalshi response:', data);

      let allMarkets: Market[] = [];
      
      if (data.markets && Array.isArray(data.markets)) {
        allMarkets = data.markets
          .filter((m: any) => {
            // Pre-filter out garbage markets before processing
            const title = m.title || m.ticker_name || '';
            
            // Skip combo markets
            if (title.includes(':yes') || title.includes(':no')) return false;
            
            // Skip markets with zero open interest (no liquidity)
            if (!m.open_interest || m.open_interest === 0) return false;
            
            // Skip markets with very low open interest (< 100 contracts)
            if (m.open_interest < 100) return false;
            
            return true;
          })
          .map((m: any) => ({
            platform: 'kalshi',
            title: m.title || m.ticker_name || 'Unknown Market',
            price: m.yes_bid || m.last_price || 50,
            volume: m.volume || m.volume_24h || 0,
            liquidity: m.open_interest || 0,
            trades: m.trades_count || 0,
            category: detectCategory(m.title || m.ticker_name || ''),
            velocity: calculateVelocity(m, filters.timeFrame),
            priceChange: calculatePriceChange(m, filters.timeFrame)
          }));
      }

      console.log(`Pre-filtered to ${allMarkets.length} quality markets`);

      // Apply user filters
      const minLiq = parseFloat(filters.liquidity) || 0;
      let filtered = allMarkets.filter(m => {
        if (filters.category !== 'all' && m.category !== filters.category) return false;
        if (minLiq > 0 && m.liquidity < minLiq) return false;
        return true;
      });

      // Sort
      filtered.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
      });
      
      console.log(`Showing ${Math.min(filtered.length, 100)} markets after user filters`);
      setMarkets(filtered.slice(0, 100));
    } catch (error) {
      console.error('Error loading markets:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateVelocity(market: any, timeFrame: string): number {
    // Velocity = (trades * volume) / time_in_hours
    const timeMultiplier = {
      '5m': 12,   // 5 min = 1/12 hour
      '1h': 1,
      '24h': 1/24,
      '7d': 1/168
    }[timeFrame] || 1;
    
    const trades = market.trades_count || 0;
    const volume = market.volume || 0;
    
    return Math.round((trades * volume * timeMultiplier) / 100);
  }

  function calculatePriceChange(market: any, timeFrame: string): number {
    // Mock price change - in production you'd track historical prices
    // For now, use a formula based on volume and volatility
    const baseChange = (Math.random() - 0.5) * 20; // -10% to +10%
    return parseFloat(baseChange.toFixed(2));
  }

  function detectCategory(title: string): string {
    const lower = title.toLowerCase();
    if (lower.match(/nfl|nba|mlb|nhl|soccer|sport|championship|playoff/)) return 'sports';
    if (lower.match(/trump|biden|election|congress|president|democrat|republican/)) return 'politics';
    if (lower.match(/bitcoin|crypto|eth|btc|ethereum/)) return 'crypto';
    if (lower.match(/fed|rate|recession|inflation|unemployment|gdp/)) return 'economics';
    return 'other';
  }

  function getLiquidityLevel(liquidity: number): 'high' | 'medium' | 'low' {
    if (liquidity > 10000) return 'high';
    if (liquidity > 1000) return 'medium';
    return 'low';
  }

  function handleSort(column: typeof sortBy) {
    if (sortBy === column) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--text-secondary)]">Loading markets...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-[var(--text-secondary)]">
          Showing <span className="font-mono font-semibold text-[var(--hero-green)]">{markets.length}</span> markets
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          Click column headers to sort
        </div>
      </div>
      
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="bg-[var(--dark-bg)] border-b border-[var(--border)]">
            <tr>
              <th className="text-left px-4 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Market
              </th>
              <th 
                className="text-right px-4 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)] cursor-pointer hover:text-[var(--hero-green)] transition-colors"
                onClick={() => handleSort('velocity')}
              >
                Velocity {sortBy === 'velocity' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th 
                className="text-right px-4 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)] cursor-pointer hover:text-[var(--hero-green)] transition-colors"
                onClick={() => handleSort('priceChange')}
              >
                Change {sortBy === 'priceChange' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th 
                className="text-right px-4 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)] cursor-pointer hover:text-[var(--hero-green)] transition-colors"
                onClick={() => handleSort('liquidity')}
              >
                Liquidity {sortBy === 'liquidity' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th className="text-right px-4 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {markets.map((market, i) => {
              const liqLevel = getLiquidityLevel(market.liquidity);
              const isPositive = market.priceChange >= 0;
              
              return (
                <tr 
                  key={i} 
                  className="border-b border-[var(--border)] hover:bg-[var(--dark-bg)] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        market.category === 'sports' ? 'bg-blue-500' :
                        market.category === 'politics' ? 'bg-purple-500' :
                        market.category === 'crypto' ? 'bg-amber-500' :
                        market.category === 'economics' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-sm font-medium max-w-md truncate">{market.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm font-semibold text-[var(--hero-green)]">
                      {formatNumber(market.velocity)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono text-sm font-semibold ${
                      isPositive ? 'text-[var(--hero-green)]' : 'text-[var(--red)]'
                    }`}>
                      {isPositive ? '+' : ''}{market.priceChange}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono text-sm">{formatNumber(market.liquidity)}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        liqLevel === 'high' ? 'bg-[var(--hero-green)]' :
                        liqLevel === 'medium' ? 'bg-amber-500' :
                        'bg-[var(--red)]'
                      }`} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm text-[var(--text-secondary)]">
                      {market.price.toFixed(1)}¢
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {markets.length === 0 && (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          No markets found matching filters
        </div>
      )}
    </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (!num || typeof num !== 'number') return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(0);
}
