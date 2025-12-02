'use client';

import { useEffect, useState } from 'react';

const TOKENS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 65432.10, change: 2.5 },
  { symbol: 'ETH', name: 'Ethereum', price: 3456.78, change: -1.2 },
  { symbol: 'SOL', name: 'Solana', price: 145.20, change: 5.4 },
  { symbol: 'NEX', name: 'Nexus', price: 1.24, change: 12.5 },
  { symbol: 'BNB', name: 'Binance Coin', price: 543.21, change: 0.5 },
  { symbol: 'XRP', name: 'Ripple', price: 0.65, change: -0.2 },
  { symbol: 'ADA', name: 'Cardano', price: 0.45, change: 1.1 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.12, change: -3.4 },
];

export default function Ticker() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 1000);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black/50 border-b border-white/10 overflow-hidden whitespace-nowrap py-2">
      <div className="inline-block animate-marquee">
        {[...TOKENS, ...TOKENS, ...TOKENS].map((token, i) => (
          <span key={i} className="mx-6 text-sm font-mono">
            <span className="font-bold text-gray-300">{token.symbol}</span>
            <span className="mx-2 text-white">${token.price.toFixed(2)}</span>
            <span className={token.change >= 0 ? 'text-green-400' : 'text-red-400'}>
              {token.change >= 0 ? '▲' : '▼'} {Math.abs(token.change)}%
            </span>
          </span>
        ))}
      </div>
      <style jsx>{`
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
