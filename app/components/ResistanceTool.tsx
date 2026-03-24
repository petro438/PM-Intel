'use client';

export default function ResistanceTool({ filters }: { filters: any }) {
  const mockData = [
    { market: 'Trump wins 2024', currentPrice: 58.5, levels: [
      { price: 65, depth: 92000, type: 'resistance' },
      { price: 60, depth: 185000, type: 'resistance' },
      { price: 55, depth: 125000, type: 'support' },
      { price: 50, depth: 78000, type: 'support' }
    ]},
  ];

  return (
    <div className="space-y-6">
      {mockData.map((data, i) => (
        <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">{data.market}</h3>
            <div className="text-sm text-[var(--text-secondary)]">
              Current Price: <span className="font-mono text-[var(--hero-green)]">{data.currentPrice}¢</span>
            </div>
          </div>
          <div className="space-y-2">
            {data.levels.map((level, j) => {
              const width = (level.depth / 220000) * 100;
              const color = level.type === 'resistance' ? 'bg-red-500/20 border-red-500' : 'bg-green-500/20 border-green-500';
              const textColor = level.type === 'resistance' ? 'text-red-500' : 'text-green-500';
              return (
                <div key={j} className="flex items-center gap-4">
                  <div className={`font-mono text-sm font-semibold w-12 ${textColor}`}>{level.price}¢</div>
                  <div className="flex-1 max-w-md">
                    <div className={`h-6 ${color} border-l-4 rounded flex items-center px-2`} style={{ width: `${width}%` }}>
                      <span className="text-xs text-[var(--text-muted)]">${(level.depth / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] uppercase w-20">{level.type}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
