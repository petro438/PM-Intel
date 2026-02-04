#!/bin/bash

echo "🧹 Cleaning up..."
rm -rf node_modules
rm -rf .next
rm -f package-lock.json

echo "📦 Installing dependencies..."
npm install

echo "✅ Setup complete! Now run: npm run dev"
