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
}

export default function ActivityMonitor({ filters }: { filters: any }) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
  }, [filters]);

  async function loadMarkets() {
    setLoading(true);
    try {
      const promises = [];
      
      if (filters.platform === 'all' || filters.platform === 'polymarket') {
        promises.push(
          fetch('/api/polymarket?limit=50').then(r => r.json())
        );
      }
      
      if (filters.platform === 'all' || filters.platform === 'kalshi') {
        promises.push(
          fetch('/api/kalshi?limit=50').then(r => r.json())
        );
      }

      const results = await Promise.all(promises);
      
      let allMarkets: Market[] = [];
      
      // Process Polymarket data
      if (results[0] && Array.isArray(results[0])) {
        allMarkets = allMarkets.concat(
          results[0].map((m: any) => ({
            platform: 'polymarket',
            title: m.question || m.title,
            price: (m.outcomePrices?.[0] || 0.5) * 100,
            volume: m.volume24hr || 0,
            liquidity: m.liquidity || 0,
            trades: m.trades || 0,
            category: detectCategory(m.question || m.title)
          }))
        );
      }

      // Apply filters
      const minLiq = parseFloat(filters.liquidity) || 0;
      let filtered = allMarkets.filter(m => {
        if (filters.category !== 'all' && m.category !== filters.category) return false;
        if (m.volume < minLiq) return false;
        return true;
      });

      filtered.sort((a, b) => b.volume - a.volume);
      setMarkets(filtered.slice(0, 20));
    } catch (error) {
      console.error('Error loading markets:', error);
      setMarkets(getMockMarkets());
    } finally {
      setLoading(false);
    }
  }

  function detectCategory(title: string): string {
    const lower = title.toLowerCase();
    if (lower.match(/nfl|nba|mlb|nhl|soccer|sport|championship|playoff/)) return 'sports';
    if (lower.match(/trump|biden|election|congress|president|democrat|republican/)) return 'politics';
    if (lower.match(/bitcoin|crypto|eth|btc|ethereum/)) return 'crypto';
    if (lower.match(/fed|rate|recession|inflation|unemployment|gdp/)) return 'economics';
    return 'other';
  }

  function getMockMarkets(): Market[] {
    return [
      { platform: 'polymarket', title: 'Trump wins 2024 Presidential Election?', price: 58.2, volume: 2847500, liquidity: 485000, trades: 12458, category: 'politics' },
      { platform: 'polymarket', title: 'Bitcoin to reach $100k in 2024?', price: 32.8, volume: 1925300, liquidity: 320000, trades: 8932, category: 'crypto' },
      { platform: 'kalshi', title: 'Chiefs win Super Bowl LVIII?', price: 67.5, volume: 1543200, liquidity: 275000, trades: 6821, category: 'sports' },
      // ... add more mock data
    ];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--text-secondary)]">Loading markets...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {markets.map((market, i) => (
        <div
          key={i}
          className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--hero-green)] transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded uppercase tracking-wide ${
              market.platform === 'polymarket' ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {market.platform}
            </span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              Math.random() > 0.5 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {Math.random() > 0.5 ? '↗' : '↘'} {(Math.random() * 10).toFixed(1)}%
            </span>
          </div>
          
          <h3 className="text-[0.95rem] font-semibold mb-3 line-clamp-2">{market.title}</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[0.7rem] text-[var(--text-muted)] uppercase font-semibold mb-1">Price</div>
              <div className="text-lg font-bold font-mono text-[var(--hero-green)]">{market.price.toFixed(1)}¢</div>
            </div>
            <div>
              <div className="text-[0.7rem] text-[var(--text-muted)] uppercase font-semibold mb-1">Volume 24h</div>
              <div className="text-lg font-bold font-mono">${formatNumber(market.volume)}</div>
            </div>
            <div>
              <div className="text-[0.7rem] text-[var(--text-muted)] uppercase font-semibold mb-1">Liquidity</div>
              <div className="text-lg font-bold font-mono">${formatNumber(market.liquidity)}</div>
            </div>
            <div>
              <div className="text-[0.7rem] text-[var(--text-muted)] uppercase font-semibold mb-1">Trades</div>
              <div className="text-lg font-bold font-mono">{formatNumber(market.trades)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatNumber(num: number): string {
  if (!num || typeof num !== 'number') return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(0);
}
