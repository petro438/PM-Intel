'use client';

export default function Leaderboard({ filters }: { filters: any }) {
  const mockData = [
    { rank: 1, address: '0x742d...bEb2', platform: 'Polymarket', pnl: 284750, volume: 2847500, winRate: 68.5 },
    { rank: 2, address: '0x8Ba1...BA72', platform: 'Polymarket', pnl: 192530, volume: 1925300, winRate: 64.2 },
    { rank: 3, address: '0x4Bfa...E2E2', platform: 'Kalshi', pnl: 154320, volume: 1543200, winRate: 71.8 },
    { rank: 4, address: '0x9f7b...0a9f', platform: 'Polymarket', pnl: 123480, volume: 1234800, winRate: 59.3 },
    { rank: 5, address: '0x1a2b...9s0t', platform: 'Polymarket', pnl: 98250, volume: 982500, winRate: 62.7 },
  ];

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-green-500/5">
          <tr>
            <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Rank</th>
            <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Trader</th>
            <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Platform</th>
            <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">P&L</th>
            <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Volume</th>
            <th className="text-left px-5 py-4 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((trader) => (
            <tr key={trader.rank} className="border-t border-[var(--border)] hover:bg-green-500/5 transition-colors">
              <td className="px-5 py-4"><span className="font-mono font-bold text-[var(--hero-green)]">#{trader.rank}</span></td>
              <td className="px-5 py-4"><span className="font-mono text-sm text-[var(--text-secondary)]">{trader.address}</span></td>
              <td className="px-5 py-4"><span className={`text-xs px-2 py-1 rounded ${trader.platform === 'Polymarket' ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'}`}>{trader.platform}</span></td>
              <td className="px-5 py-4"><span className="font-mono font-semibold text-[var(--hero-green)]">${(trader.pnl / 1000).toFixed(1)}K</span></td>
              <td className="px-5 py-4"><span className="font-mono">${(trader.volume / 1000000).toFixed(1)}M</span></td>
              <td className="px-5 py-4"><span className="font-mono">{trader.winRate}%</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
