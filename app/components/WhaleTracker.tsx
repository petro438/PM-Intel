'use client';

export default function WhaleTracker({ filters }: { filters: any }) {
  const mockWhales = [
    { address: '0x742d35Cc', market: 'Trump wins 2024 Election?', side: 'YES', price: 87.5, amount: 45000, time: '2h ago' },
    { address: '0x8Ba1f109', market: 'Bitcoin to $100k in 2024?', side: 'NO', price: 32.0, amount: 28500, time: '4h ago' },
    { address: '0x4Bfa0cF2', market: 'Chiefs win Super Bowl?', side: 'YES', price: 65.2, amount: 18200, time: '6h ago' },
  ];

  return (
    <div className="space-y-4">
      {mockWhales.map((whale, i) => (
        <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] border-l-4 border-l-[var(--hero-green)] rounded-lg p-5 flex justify-between items-center hover:translate-x-1 transition-transform">
          <div className="flex-1">
            <div className="font-mono text-sm text-[var(--hero-green)] font-semibold mb-2">{whale.address}...</div>
            <div className="font-semibold mb-2">{whale.market}</div>
            <div className="flex gap-6 text-sm text-[var(--text-secondary)]">
              <span className={whale.side === 'YES' ? 'text-[var(--hero-green)]' : 'text-[var(--red)]'}>
                {whale.side} @ {whale.price}¢
              </span>
              <span>{whale.time}</span>
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[var(--hero-green)]">
            ${(whale.amount / 1000).toFixed(1)}K
          </div>
        </div>
      ))}
    </div>
  );
}
