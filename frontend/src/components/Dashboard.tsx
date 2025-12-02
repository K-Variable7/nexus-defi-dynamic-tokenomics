"use client";

import { useState } from "react";
import SwapCard from "./SwapCard";
import StakingCard from "./StakingCard";
import LiquidityLocker from "./LiquidityLocker";

export default function Dashboard() {
  const [volume, setVolume] = useState(500); // Mock volume
  const [pot, setPot] = useState(100); // Mock pot
  const [projection, setProjection] = useState(150); // Mock projection
  
  // User Analytics State
  const [myVolume, setMyVolume] = useState(12.5); // Mock user volume
  const [myRewards, setMyRewards] = useState(0.5); // Mock user rewards
  const [myRank, setMyRank] = useState(42); // Mock rank

  return (
    <div className="min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white">
      <main className="p-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 mt-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Algorithmic <span className="neon-text">Tokenomics</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            A dual-token ecosystem powered by dynamic volume-based taxation and automated buybacks.
          </p>
        </div>

        {/* Personal Analytics Section */}
        <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 text-white/80">Your Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Your Trading Volume</p>
                    <p className="text-2xl font-bold text-blue-400">{myVolume} ETH</p>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Rewards Earned</p>
                    <p className="text-2xl font-bold text-green-400">{myRewards} ETH</p>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Global Rank</p>
                    <p className="text-2xl font-bold text-purple-400">#{myRank}</p>
                    <p className="text-xs text-gray-500">Top 5% of traders</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Volume Card */}
          <div className="glass-card p-8 rounded-2xl group">
            <h2 className="text-xl font-medium text-gray-400 mb-2 group-hover:text-blue-400 transition-colors">Trading Volume</h2>
            <p className="text-4xl font-bold text-white mb-4">{volume} ETH</p>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${(volume / 1000) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">Target: 1000 ETH</p>
          </div>

          {/* Pot Card */}
          <div className="glass-card p-8 rounded-2xl group">
            <h2 className="text-xl font-medium text-gray-400 mb-2 group-hover:text-green-400 transition-colors">Buyback Pot</h2>
            <p className="text-4xl font-bold text-white mb-2">{pot} TAX</p>
            <p className="text-sm text-green-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Accumulation
            </p>
          </div>

          {/* Projection Card */}
          <div className="glass-card p-8 rounded-2xl group">
            <h2 className="text-xl font-medium text-gray-400 mb-2 group-hover:text-purple-400 transition-colors">30-Day Projection</h2>
            <p className="text-4xl font-bold text-white mb-2">{projection} TAX</p>
            <p className="text-sm text-gray-500">Based on current volume trends</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-16">
          {/* Staking Card */}
          <div className="glass-panel rounded-2xl overflow-hidden">
             <StakingCard />
          </div>

          {/* Swap Card */}
          <div className="glass-panel rounded-2xl overflow-hidden">
             <SwapCard />
          </div>
        </div>

        {/* Liquidity Locker */}
        <div className="mt-8 glass-panel rounded-2xl p-1">
            <LiquidityLocker />
        </div>

        {/* Feature Links */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/arcade" className="block p-6 glass-card rounded-xl hover:scale-105 transition-transform">
            <h3 className="text-2xl font-bold text-red-500 mb-2">Roulette Arcade</h3>
            <p className="text-gray-400">Play European Roulette with instant settlement.</p>
          </a>
          
          <a href="/vault" className="block p-6 glass-card rounded-xl hover:scale-105 transition-transform">
            <h3 className="text-2xl font-bold text-purple-500 mb-2">Multiplier Vault</h3>
            <p className="text-gray-400">Deposit ETH. One winner takes 50% bonus. Everyone splits the rest.</p>
          </a>

          <a href="/prediction" className="block p-6 glass-card rounded-xl hover:scale-105 transition-transform">
            <h3 className="text-2xl font-bold text-blue-500 mb-2">Prediction Market</h3>
            <p className="text-gray-400">Bet on ETH price movements. Binary options with 5-minute rounds.</p>
          </a>
        </div>
      </main>
    </div>
  );
}
