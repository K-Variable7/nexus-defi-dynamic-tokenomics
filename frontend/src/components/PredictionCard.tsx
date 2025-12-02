import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { PREDICTION_ABI } from '../constants';
import { useContractAddress } from '../hooks/useContractAddress';

export default function PredictionCard({ symbol = "ETH" }: { symbol?: string }) {
  const { address } = useAccount();
  const predictionAddress = useContractAddress('PREDICTION');
  const [betAmount, setBetAmount] = useState('0.01');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Read Market Info
  const { data: marketInfo } = useReadContract({
    address: predictionAddress,
    abi: PREDICTION_ABI,
    functionName: 'markets',
    args: [symbol],
  });

  const currentEpoch = marketInfo ? marketInfo[1] : undefined;
  const isPair = marketInfo ? marketInfo[5] : false;

  // Read Round Data
  const { data: roundData, refetch: refetchRound } = useReadContract({
    address: predictionAddress,
    abi: PREDICTION_ABI,
    functionName: 'rounds',
    args: currentEpoch !== undefined ? [symbol, currentEpoch] : undefined,
  });

  const { writeContract: bet, isPending: isBetting } = useWriteContract();
  const { writeContract: executeRound, isPending: isLocking } = useWriteContract();

  // Timer Logic
  useEffect(() => {
    if (!roundData) return;
    // roundData struct: [epoch, start, lock, close, lockPrice, closePrice, total, bull, bear, oracleCalled, closed]
    const lockTimestamp = Number(roundData[2]);
    
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = lockTimestamp - now;
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [roundData]);

  const handleBet = (position: 0 | 1) => { // 0 = Bull, 1 = Bear
    if (!betAmount || !predictionAddress) return;
    bet({
      address: predictionAddress,
      abi: PREDICTION_ABI,
      functionName: 'bet',
      args: [symbol, position],
      value: parseEther(betAmount),
    });
  };

  const handleLock = () => {
    if (!predictionAddress) return;
    executeRound({
      address: predictionAddress,
      abi: PREDICTION_ABI,
      functionName: 'executeRound',
      args: [symbol],
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalPool = roundData ? formatEther(roundData[6]) : '0';
  const bullPool = roundData ? formatEther(roundData[7]) : '0';
  const bearPool = roundData ? formatEther(roundData[8]) : '0';

  return (
    <div className="glass-panel border border-white/10 p-6 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white neon-text">🔮 {symbol} Prediction</h3>
          {isPair && <span className="text-xs text-blue-400 font-mono border border-blue-500/30 px-2 py-0.5 rounded">PAIR MARKET</span>}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Next Round In</p>
          <p className="text-xl font-mono font-bold text-yellow-400">{formatTime(timeLeft)}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        {/* UP Button */}
        <button
          onClick={() => handleBet(0)}
          disabled={isBetting || timeLeft === 0}
          className="flex-1 bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 p-4 rounded-xl transition-all group backdrop-blur-sm"
        >
          <div className="text-green-400 font-bold text-lg mb-1 group-hover:scale-110 transition-transform">
            {isPair ? `${symbol.split('-')[0]} Wins` : 'UP ↗'}
          </div>
          <div className="text-xs text-gray-400">{Number(bullPool).toFixed(3)} ETH</div>
          <div className="text-xs text-green-500/70 mt-1">2.1x Payout</div>
        </button>

        {/* DOWN Button */}
        <button
          onClick={() => handleBet(1)}
          disabled={isBetting || timeLeft === 0}
          className="flex-1 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 p-4 rounded-xl transition-all group backdrop-blur-sm"
        >
          <div className="text-red-400 font-bold text-lg mb-1 group-hover:scale-110 transition-transform">
            {isPair ? `${symbol.split('-')[1]} Wins` : 'DOWN ↘'}
          </div>
          <div className="text-xs text-gray-400">{Number(bearPool).toFixed(3)} ETH</div>
          <div className="text-xs text-red-500/70 mt-1">1.8x Payout</div>
        </button>
      </div>

      <div className="bg-black/50 p-4 rounded-lg mb-4 border border-white/5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Prize Pool</span>
          <span className="text-white font-bold">{Number(totalPool).toFixed(4)} ETH</span>
        </div>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-center font-mono focus:border-blue-500 outline-none"
        />
      </div>

      {timeLeft === 0 && (
        <button
          onClick={handleLock}
          disabled={isLocking}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.4)]"
        >
          {isLocking ? 'Locking...' : '⏳ Lock Round & Start Next'}
        </button>
      )}
    </div>
  );
}
