'use client';

import { useState } from 'react';
import ActivityMonitor from './components/ActivityMonitor';
import Leaderboard from './components/Leaderboard';
import WhaleTracker from './components/WhaleTracker';
import ResistanceTool from './components/ResistanceTool';
import SharpsVsSquares from './components/SharpsVsSquares';

export default function Home() {
  const [activeTab, setActiveTab] = useState('activity');
  const [filters, setFilters] = useState({
    platform: 'kalshi',
    category: 'all',
    liquidity: '',
    timeFrame: '24h'
  });

  return (
    <div className="min-h-screen bg-[var(--dark-bg)]">
      {/* Header */}
      <header className="bg-[var(--card-bg)] border-b border-[var(--border)] px-8 py-4 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--hero-green)]">PM INTEL</h1>
          <nav className="flex gap-8">
            <a href="#" className="text-[var(--hero-green)] text-sm font-medium">Dashboard</a>
            <a href="#" className="text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--hero-green)] transition-colors">Markets</a>
            <a href="#" className="text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--hero-green)] transition-colors">Analytics</a>
          </nav>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-[var(--border)]">
          {[
            { id: 'activity', label: 'Activity Monitor' },
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'whales', label: 'Whale Tracker' },
            { id: 'resistance', label: 'Resistance Tool' },
            { id: 'flow', label: 'Sharps vs Squares' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-[0.95rem] font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'text-[var(--hero-green)] border-[var(--hero-green)]'
                  : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6 mb-8 flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[0.75rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Platform
            </label>
            <select
              value={filters.platform}
              onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
              className="bg-[var(--dark-bg)] border border-[var(--border)] text-[var(--text-primary)] px-4 py-2 rounded-md text-sm"
            >
              <option value="kalshi">Kalshi</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.75rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="bg-[var(--dark-bg)] border border-[var(--border)] text-[var(--text-primary)] px-4 py-2 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="sports">Sports</option>
              <option value="politics">Politics</option>
              <option value="crypto">Crypto</option>
              <option value="economics">Economics</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.75rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Min Liquidity
            </label>
            <input
              type="number"
              value={filters.liquidity}
              onChange={(e) => setFilters({ ...filters, liquidity: e.target.value })}
              placeholder="$10,000"
              className="bg-[var(--dark-bg)] border border-[var(--border)] text-[var(--text-primary)] px-4 py-2 rounded-md text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.75rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Time Frame
            </label>
            <select
              value={filters.timeFrame}
              onChange={(e) => setFilters({ ...filters, timeFrame: e.target.value })}
              className="bg-[var(--dark-bg)] border border-[var(--border)] text-[var(--text-primary)] px-4 py-2 rounded-md text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'activity' && <ActivityMonitor filters={filters} />}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'whales' && <WhaleTracker filters={filters} />}
        {activeTab === 'resistance' && <ResistanceTool filters={filters} />}
        {activeTab === 'flow' && <SharpsVsSquares filters={filters} />}
      </div>
    </div>
  );
}
