# PM Intel - Prediction Markets Intelligence Dashboard

Built with Next.js 15, TypeScript, and React 19.

## Features

- **Activity Monitor**: Real-time market tracking across Polymarket & Kalshi
- **Leaderboard**: Top trader rankings
- **Whale Tracker**: Large position monitoring  
- **Resistance Tool**: Order book depth analysis
- **Sharps vs Squares**: Maker/Taker flow analysis

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel dashboard for auto-deployments.

## API Routes

- `/api/polymarket` - Proxies Polymarket Gamma API
- `/api/kalshi` - Proxies Kalshi Trade API

Both routes handle CORS and caching automatically.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS-in-JS with CSS Variables
- **APIs**: Polymarket Gamma API, Kalshi Trade API
- **Deployment**: Vercel

## Project Structure

```
pm-intel-nextjs/
├── app/
│   ├── api/
│   │   ├── polymarket/route.ts
│   │   └── kalshi/route.ts
│   ├── components/
│   │   ├── ActivityMonitor.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── WhaleTracker.tsx
│   │   ├── ResistanceTool.tsx
│   │   └── SharpsVsSquares.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── package.json
└── tsconfig.json
```
