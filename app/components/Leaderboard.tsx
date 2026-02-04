'use client';

import { useEffect, useState } from 'react';

interface Trader {
  rank: string;
  proxyWallet: string;
  userName: string | null;
  vol: number;
  pnl: number;
  profileImage: string | null;
  xUsername: string | null;
  verifiedBadge: boolean;
}

interface Trade {
  side: 'BUY' | 'SELL';
  title: string;
  outcome: string;
  size: number;
  price: number;
  timestamp: number;
  transactionHash: string;
}

export default function Leaderboard() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('DAY');
  const [orderBy, setOrderBy] = useState('PNL');
  const [category, setCategory] = useState('OVERALL');
  
  // Side panel state
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [traderTrades, setTraderTrades] = useState<Trade[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [timePeriod, orderBy, category]);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const response = await fetch(`/api/polymarket-leaderboard?category=${category}&timePeriod=${timePeriod}&orderBy=${orderBy}&limit=50`);
      const data = await response.json();
      
      console.log('Leaderboard data:', data);
      
      if (data.traders && Array.isArray(data.traders)) {
        setTraders(data.traders);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTraderTrades(trader: Trader) {
    setSelectedTrader(trader);
    setLoadingTrades(true);
    setTraderTrades([]);
    
    try {
      const response = await fetch(`/api/polymarket-trades?user=${trader.proxyWallet}&limit=50`);
      const data = await response.json();
      
      console.log('Trader trades:', data);
      
      if (data.trades && Array.isArray(data.trades)) {
        setTraderTrades(data.trades);
      }
    } catch (error) {
      console.error('Error loading trader trades:', error);
    } finally {
      setLoadingTrades(false);
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
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--text-secondary)]">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Filters */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4 mb-6 flex flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[0.75rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Time Period
          </label>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="bg-[var(--dark-bg)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm"
          >
            <option value="DAY">Today</option>
            <option value="WEEK">This Week</option>
            <option value="MONTH">This Month</option>
            <option value="ALL">All Time</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[0.75rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Sort By
          </label>
          <select
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value)}
            className="bg-[var(--dark-bg)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm"
          >
            <option value="PNL">Profit & Loss</option>
            <option value="VOL">Volume</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[0.75rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[var(--dark-bg)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm"
          >
            <option value="OVERALL">Overall</option>
            <option value="POLITICS">Politics</option>
            <option value="SPORTS">Sports</option>
            <option value="CRYPTO">Crypto</option>
            <option value="CULTURE">Culture</option>
            <option value="ECONOMICS">Economics</option>
            <option value="TECH">Tech</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--dark-bg)] border-b border-[var(--border)]">
            <tr>
              <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Rank</th>
              <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Trader</th>
              <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Platform</th>
              <th className="text-right px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">P&L</th>
              <th className="text-right px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Volume</th>
            </tr>
          </thead>
          <tbody>
            {traders.map((trader) => {
              const isProfitable = trader.pnl >= 0;
              return (
                <tr 
                  key={trader.proxyWallet} 
                  onClick={() => loadTraderTrades(trader)}
                  className="border-t border-[var(--border)] hover:bg-[var(--dark-bg)] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <span className={`font-mono font-bold ${
                      parseInt(trader.rank) <= 3 ? 'text-[var(--hero-green)]' : 'text-[var(--text-secondary)]'
                    }`}>
                      #{trader.rank}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {trader.profileImage && (
                        <img 
                          src={trader.profileImage} 
                          alt={trader.userName || 'Trader'} 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium hover:text-[var(--hero-green)] transition-colors">
                            {trader.userName || formatAddress(trader.proxyWallet)}
                          </span>
                          {trader.verifiedBadge && (
                            <span className="text-blue-400">✓</span>
                          )}
                        </div>
                        {trader.xUsername && (
                          <div className="text-xs text-[var(--text-muted)]">@{trader.xUsername}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                      Polymarket
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`font-mono font-semibold ${
                      isProfitable ? 'text-[var(--hero-green)]' : 'text-[var(--red)]'
                    }`}>
                      {isProfitable ? '+' : ''}${(trader.pnl / 1000).toFixed(1)}K
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-mono">${(trader.vol / 1000000).toFixed(2)}M</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {traders.length === 0 && !loading && (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          No traders found
        </div>
      )}

      {/* Side Panel */}
      {selectedTrader && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setSelectedTrader(null)}
        >
          <div 
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[var(--card-bg)] border-l border-[var(--border)] shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="sticky top-0 bg-[var(--dark-bg)] border-b border-[var(--border)] p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {selectedTrader.profileImage && (
                    <img 
                      src={selectedTrader.profileImage} 
                      alt={selectedTrader.userName || 'Trader'} 
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">
                        {selectedTrader.userName || formatAddress(selectedTrader.proxyWallet)}
                      </h2>
                      {selectedTrader.verifiedBadge && (
                        <span className="text-blue-400 text-xl">✓</span>
                      )}
                    </div>
                    {selectedTrader.xUsername && (
                      <div className="text-sm text-[var(--text-muted)]">@{selectedTrader.xUsername}</div>
                    )}
                    <div className="text-xs text-[var(--text-muted)] font-mono mt-1">
                      {selectedTrader.proxyWallet}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTrader(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Rank</div>
                  <div className="text-lg font-bold font-mono text-[var(--hero-green)]">#{selectedTrader.rank}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)] uppercase mb-1">P&L</div>
                  <div className={`text-lg font-bold font-mono ${selectedTrader.pnl >= 0 ? 'text-[var(--hero-green)]' : 'text-[var(--red)]'}`}>
                    {selectedTrader.pnl >= 0 ? '+' : ''}${(selectedTrader.pnl / 1000).toFixed(1)}K
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Volume</div>
                  <div className="text-lg font-bold font-mono">${(selectedTrader.vol / 1000000).toFixed(2)}M</div>
                </div>
              </div>
            </div>

            {/* Trades List */}
            <div className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)] mb-4">
                Recent Trades
              </h3>

              {loadingTrades ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-[var(--text-secondary)]">Loading trades...</div>
                </div>
              ) : traderTrades.length > 0 ? (
                <div className="space-y-3">
                  {traderTrades.map((trade, i) => (
                    <div 
                      key={i}
                      className="bg-[var(--dark-bg)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--hero-green)] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{trade.title}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{trade.outcome}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          trade.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.side}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex gap-4">
                          <div>
                            <span className="text-[var(--text-muted)] text-xs">Price: </span>
                            <span className="font-mono">{trade.price.toFixed(1)}¢</span>
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)] text-xs">Size: </span>
                            <span className="font-mono">{trade.size.toFixed(0)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {formatTimestamp(trade.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--text-secondary)]">
                  No trades found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
