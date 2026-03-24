'use client';

export default function SharpsVsSquares({ filters }: { filters: any }) {
  const mockFlow = [
    { title: 'Trump wins 2024?', makerPct: 72, takerPct: 28 },
    { title: 'Bitcoin to $100k?', makerPct: 58, takerPct: 42 },
    { title: 'Chiefs win Super Bowl?', makerPct: 65, takerPct: 35 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockFlow.map((market, i) => (
        <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-5">
          <div className="mb-3">
            <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">POLYMARKET</span>
          </div>
          <h3 className="font-semibold mb-4">{market.title}</h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Maker (Sharp)</div>
              <div className="text-2xl font-bold font-mono text-[var(--hero-green)]">{market.makerPct}%</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Taker (Square)</div>
              <div className="text-2xl font-bold font-mono text-amber-500">{market.takerPct}%</div>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex">
            <div className="bg-[var(--hero-green)]" style={{ width: `${market.makerPct}%` }}></div>
            <div className="bg-amber-500" style={{ width: `${market.takerPct}%` }}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
            <span className={market.makerPct > market.takerPct ? 'text-[var(--hero-green)]' : ''}>Sharp {market.makerPct > market.takerPct ? '✓' : ''}</span>
            <span className={market.takerPct > market.makerPct ? 'text-amber-500' : ''}>Square {market.takerPct > market.makerPct ? '✓' : ''}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
