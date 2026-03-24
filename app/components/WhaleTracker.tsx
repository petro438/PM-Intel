'use client';

import { useEffect, useState } from 'react';

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
  traderProfit?: number;
  traderVolume?: number;
  traderRank?: number;
}

interface Stats {
  totalVolume: number;
  buyVolume: number;
  sellVolume: number;
  uniqueWhales: number;
  profitableTraders: number;
}

export default function WhaleTracker() {
  const [trades, setTrades] = useState<WhaleTrade[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalVolume: 0,
    buyVolume: 0,
    sellVolume: 0,
    uniqueWhales: 0,
    profitableTraders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [minAmount, setMinAmount] = useState('5000');
  const [traderFilter, setTraderFilter] = useState('all'); // all, roi, profit, top100
  const [showAmericanOdds, setShowAmericanOdds] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadWhaleTrades();
    
    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadWhaleTrades, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [minAmount, traderFilter, autoRefresh]);

  async function loadWhaleTrades() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        minAmount,
        limit: '50',
      });
      
      // Map filter to API params
      if (traderFilter === 'top100') {
        params.append('onlyTop100', 'true');
      } else if (traderFilter === 'profit10k') {
        params.append('minProfit', '10000');
      } else if (traderFilter === 'profit50k') {
        params.append('minProfit', '50000');
      } else if (traderFilter === 'roi50') {
        params.append('minROI', '50');
      } else if (traderFilter === 'roi100') {
        params.append('minROI', '100');
      }
      
      const response = await fetch(`/api/polymarket-whale-trades?${params}`);
      const data = await response.json();
      
      console.log('Whale trades data:', data);
      
      if (data.trades && Array.isArray(data.trades)) {
        setTrades(data.trades);
      }
      
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading whale trades:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatAddress(address: string): string {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }

  function formatMoney(amount: number): string {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  }

  function convertToAmericanOdds(price: number, outcome: string, side: 'BUY' | 'SELL'): string {
    // Determine if this is betting YES or NO
    // If outcome contains "No" or side is SELL, invert the price
    const isNoOutcome = outcome.toLowerCase().includes('no') || 
                       outcome.toLowerCase().includes('not') ||
                       outcome.toLowerCase().includes('won\'t');
    const isBettingNo = (side === 'SELL' && !isNoOutcome) || (side === 'BUY' && isNoOutcome);
    
    // Invert price if betting NO
    const effectivePrice = isBettingNo ? (100 - price) : price;
    
    if (effectivePrice < 50) {
      // Underdog: positive odds
      const odds = Math.round(((100 - effectivePrice) / effectivePrice) * 100);
      return `+${odds}`;
    } else {
      // Favorite: negative odds
      const odds = Math.round((effectivePrice / (100 - effectivePrice)) * 100);
      return `-${odds}`;
    }
  }

  function formatPrice(trade: WhaleTrade): string {
    if (showAmericanOdds) {
      return convertToAmericanOdds(trade.price, trade.outcome, trade.side);
    }
    return `${trade.price.toFixed(1)}¢`;
  }

  function getTraderBadge(trade: WhaleTrade): { emoji: string; color: string; label: string } | null {
    if (trade.traderRank && trade.traderRank <= 100) {
      return { emoji: '🟢', color: 'text-green-400', label: `Top ${trade.traderRank}` };
    }
    if (trade.traderProfit && trade.traderProfit >= 10000) {
      const roi = trade.traderVolume ? Math.round((trade.traderProfit / trade.traderVolume) * 100) : 0;
      return { emoji: '🟡', color: 'text-yellow-400', label: `${formatMoney(trade.traderProfit)} (${roi}% ROI)` };
    }
    return null;
  }

  const buyPercentage = stats.totalVolume > 0 
    ? Math.round((stats.buyVolume / stats.totalVolume) * 100) 
    : 50;

  return (
    <div>
      {/* Smart Money Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Smart Money Flow</div>
          <div className="text-xl font-bold font-mono text-[var(--hero-green)]">
            {formatMoney(stats.totalVolume)}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            {stats.profitableTraders} profitable traders
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Whale Conviction</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-green-400">{buyPercentage}%</div>
            <div className="text-sm text-[var(--text-muted)]">BUY</div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <div className="text-xl font-bold text-red-400">{100 - buyPercentage}%</div>
            <div className="text-sm text-[var(--text-muted)]">SELL</div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Buy Volume</div>
          <div className="text-xl font-bold font-mono text-green-400">
            {formatMoney(stats.buyVolume)}
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Sell Volume</div>
          <div className="text-xl font-bold font-mono text-red-400">
            {formatMoney(stats.sellVolume)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-[0.75rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Min Trade Size
          </label>
          <select
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="bg-[var(--dark-bg)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm"
          >
            <option value="1000">$1,000+</option>
            <option value="5000">$5,000+</option>
            <option value="10000">$10,000+</option>
            <option value="25000">$25,000+</option>
            <option value="50000">$50,000+</option>
            <option value="100000">$100,000+</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[0.75rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Trader Filter
          </label>
          <select
            value={traderFilter}
            onChange={(e) => setTraderFilter(e.target.value)}
            className="bg-[var(--dark-bg)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm"
          >
            <option value="all">All Traders</option>
            <option value="profit10k">$10K+ Profit</option>
            <option value="profit50k">$50K+ Profit</option>
            <option value="roi50">50%+ ROI</option>
            <option value="roi100">100%+ ROI</option>
            <option value="top100">Top 100 Only</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[0.75rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Odds Display
          </label>
          <select
            value={showAmericanOdds ? 'american' : 'decimal'}
            onChange={(e) => setShowAmericanOdds(e.target.value === 'american')}
            className="bg-[var(--dark-bg)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm"
          >
            <option value="decimal">Decimal (¢)</option>
            <option value="american">American (+/-)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoRefresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4 accent-[var(--hero-green)]"
          />
          <label htmlFor="autoRefresh" className="text-sm text-[var(--text-primary)] cursor-pointer">
            Auto-refresh (30s)
          </label>
        </div>

        <button
          onClick={loadWhaleTrades}
          className="px-4 py-2 bg-[var(--hero-green)] text-black font-semibold rounded-md hover:opacity-90 transition-opacity text-sm"
        >
          Refresh Now
        </button>

        <div className="ml-auto text-xs text-[var(--text-muted)]">
          Showing {trades.length} whale trades
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-[var(--text-secondary)]">Loading whale trades...</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[var(--dark-bg)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Time</th>
                <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Trader</th>
                <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Market</th>
                <th className="text-center px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Side</th>
                <th className="text-right px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Size</th>
                <th className="text-right px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Price</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => {
                const badge = getTraderBadge(trade);
                return (
                  <tr 
                    key={i}
                    className="border-t border-[var(--border)] hover:bg-[var(--dark-bg)] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="text-xs text-[var(--text-muted)]">
                        {formatTimestamp(trade.timestamp)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {badge && <span className="text-lg">{badge.emoji}</span>}
                        <div>
                          <a
                            href={`https://polymarket.com/@${trade.pseudonym || trade.proxyWallet}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:text-[var(--hero-green)] transition-colors block"
                          >
                            {trade.pseudonym || formatAddress(trade.proxyWallet)}
                          </a>
                          {badge && (
                            <div className={`text-xs ${badge.color}`}>{badge.label}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-md">
                        <div className="text-sm font-medium truncate">{trade.title}</div>
                        <div className="text-xs text-[var(--text-muted)] truncate">{trade.outcome}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                        trade.side === 'BUY' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="font-mono font-semibold text-[var(--hero-green)]">
                        {formatMoney(trade.size)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="font-mono text-sm font-semibold">
                        {formatPrice(trade)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && trades.length === 0 && (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            No whale trades found matching criteria
          </div>
        )}
      </div>
    </div>
  );
}