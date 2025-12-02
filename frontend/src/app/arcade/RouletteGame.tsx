"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from "wagmi";
import { parseEther, formatEther, decodeEventLog } from "viem";
import { ROULETTE_ABI } from "../../abis";
import { useContractAddress } from "@/hooks/useContractAddress";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

// European Roulette Wheel Order
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export default function RouletteGame() {
  const { address, isConnected } = useAccount();
  const rouletteAddress = useContractAddress('ROULETTE');
  const [betAmount, setBetAmount] = useState("0.001");
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [lastWinningNumber, setLastWinningNumber] = useState<number | null>(null);
  const [winAmount, setWinAmount] = useState<string>("0");
  const [currentRequestId, setCurrentRequestId] = useState<bigint | null>(null);

  const controls = useAnimation();

  // Write contracts
  const { writeContract: spin, data: spinHash, isPending: isSpinPending } = useWriteContract();

  // Wait for transactions
  const { isLoading: isConfirming, isSuccess: isSpinSuccess, data: receipt } = useWaitForTransactionReceipt({ 
    hash: spinHash 
  });

  // 1. Start spinning when transaction is sent (confirming)
  useEffect(() => {
    if (isConfirming) {
      setIsSpinning(true);
      setShowWinModal(false);
      // Start continuous rotation
      controls.start({
        rotate: 360 * 1000, // Spin "forever"
        transition: { duration: 2000, ease: "linear" }
      });
    }
  }, [isConfirming, controls]);

  // 2. Get Request ID from receipt
  useEffect(() => {
    if (isSpinSuccess && receipt) {
      const event = receipt.logs.map(log => {
        try {
          return decodeEventLog({
            abi: ROULETTE_ABI,
            data: log.data,
            topics: log.topics,
          });
        } catch (e) {
          return null;
        }
      }).find((e: any) => e?.eventName === 'SpinRequested');

      if (event) {
        setCurrentRequestId((event.args as any).requestId);
      }
    }
  }, [isSpinSuccess, receipt]);

  // 3. Watch for SpinResult
  useWatchContractEvent({
    address: rouletteAddress,
    abi: ROULETTE_ABI,
    eventName: 'SpinResult',
    onLogs(logs) {
      const log = logs.find((l: any) => l.args.requestId === currentRequestId);
      if (log && isSpinning && log.args.resultNumber !== undefined && log.args.won !== undefined && log.args.payout !== undefined) {
        handleGameEnd(log.args.resultNumber, log.args.won, log.args.payout);
      }
    },
    enabled: !!currentRequestId && isSpinning
  });

  const handleGameEnd = (resultNumber: bigint, won: boolean, payout: bigint) => {
    const targetNumber = Number(resultNumber);
    const index = WHEEL_NUMBERS.indexOf(targetNumber);
    const segmentAngle = 360 / 37;
    
    // Calculate target rotation to land on the number
    // We need to stop the current infinite spin and land on the target
    // Current rotation is handled by controls, but we need to set a specific value
    
    // Stop the infinite spin
    controls.stop();

    // Calculate a new target rotation that is ahead of the current visual state
    // Since we can't easily get the current visual rotation from Framer Motion in this context without refs,
    // we'll just add a fixed large rotation relative to 0 for now, or use a ref to track approximate rotation.
    // A simpler visual hack: Reset to 0 (instant) and spin to target? No, that jumps.
    
    // Better approach: Just spin 5 more full rotations + target
    const targetRotation = 360 * 5 - (index * segmentAngle);
    
    controls.start({
      rotate: targetRotation,
      transition: { duration: 4, ease: "easeOut" }
    }).then(() => {
      setIsSpinning(false);
      setLastWinningNumber(targetNumber);
      setCurrentRequestId(null);
      
      if (won) {
        setWinAmount(formatEther(payout));
        setShowWinModal(true);
      }
    });
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return 0; // Green
    if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num)) return 1; // Red
    return 2; // Black
  };

  const handleSpin = () => {
    if (!rouletteAddress || selectedNumber === null) return;
    
    spin({
      address: rouletteAddress,
      abi: ROULETTE_ABI,
      functionName: "spin",
      args: [BigInt(selectedNumber)],
      value: parseEther(betAmount),
      gas: BigInt(500000),
    });
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-white">Connect Wallet to Play</h2>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 relative">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-black">
          Nexus Roulette
        </h1>
        <p className="text-gray-400">Pick a number (0-36) or Color (Red/Black). Win up to 35x your bet!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Wheel Section */}
        <div className="relative flex justify-center items-center">
          {/* Pointer */}
          <div className="absolute top-0 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-yellow-400 drop-shadow-lg"></div>
          
          {/* Wheel */}
          <motion.div 
            className="w-80 h-80 rounded-full border-8 border-gray-800 relative overflow-hidden shadow-2xl bg-gray-900"
            animate={controls}
          >
            {WHEEL_NUMBERS.map((num, i) => {
              const angle = (360 / 37) * i;
              const color = getNumberColor(num);
              return (
                <div
                  key={num}
                  className="absolute w-full h-full top-0 left-0"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div 
                    className={`w-10 h-40 mx-auto pt-2 text-center text-xs font-bold text-white ${
                      color === 0 ? 'bg-green-600' : color === 1 ? 'bg-red-600' : 'bg-black'
                    }`}
                    style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                  >
                    <span className="block transform -rotate-90 mt-2">{num}</span>
                  </div>
                </div>
              );
            })}
            
            {/* Center Cap */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 rounded-full border-4 border-gray-700 z-10 flex items-center justify-center">
              <div className={`w-2 h-2 bg-yellow-500 rounded-full ${isSpinning ? 'animate-pulse' : ''}`}></div>
            </div>
          </motion.div>
        </div>

        {/* Betting Board */}
        <div className="space-y-6">
          {/* Color Bets */}
          <div className="flex gap-4 justify-center mb-4">
             <button 
               onClick={() => setSelectedNumber(37)}
               className={`px-6 py-2 bg-red-600 rounded font-bold text-white transition-all ${
                 selectedNumber === 37 ? 'ring-4 ring-yellow-400 scale-110' : 'hover:opacity-80'
               }`}
             >
               RED (2x)
             </button>
             <button 
               onClick={() => setSelectedNumber(0)}
               className={`px-6 py-2 bg-green-600 rounded font-bold text-white transition-all ${
                 selectedNumber === 0 ? 'ring-4 ring-yellow-400 scale-110' : 'hover:opacity-80'
               }`}
             >
               ZERO (35x)
             </button>
             <button 
               onClick={() => setSelectedNumber(38)}
               className={`px-6 py-2 bg-black rounded font-bold text-white transition-all ${
                 selectedNumber === 38 ? 'ring-4 ring-yellow-400 scale-110' : 'hover:opacity-80'
               }`}
             >
               BLACK (2x)
             </button>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {[...Array(37)].map((_, i) => {
              if (i === 0) return null; // Skip 0 as it's above
              const color = getNumberColor(i);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedNumber(i)}
                  className={`p-3 rounded font-bold transition-all ${
                    selectedNumber === i 
                      ? 'ring-2 ring-yellow-400 scale-110 z-10' 
                      : 'hover:opacity-80'
                  } ${
                    color === 0 ? 'bg-green-600 text-white' : 
                    color === 1 ? 'bg-red-600 text-white' : 
                    'bg-gray-800 text-white'
                  }`}
                >
                  {i}
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-gray-400">Bet Amount (ETH):</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white w-32"
                />
              </div>
              
              <button
                onClick={handleSpin}
                disabled={isSpinPending || isConfirming || selectedNumber === null || isSpinning}
                className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-colors"
              >
                {isSpinPending ? "Check Wallet..." : isConfirming ? "Spinning..." : isSpinning ? "Waiting for VRF..." : "Spin Wheel"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {showWinModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-gray-900 border-2 border-yellow-500 p-8 rounded-2xl text-center max-w-md w-full shadow-[0_0_50px_rgba(234,179,8,0.3)]">
              <h2 className="text-4xl font-bold text-yellow-400 mb-4">🎉 YOU WON! 🎉</h2>
              <p className="text-gray-300 mb-8 text-lg">
                The wheel landed on <span className="font-bold text-white">{lastWinningNumber}</span>!
                <br/>
                You won <span className="text-green-400">{winAmount} ETH</span>
              </p>
              <button
                onClick={() => setShowWinModal(false)}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-xl rounded-xl transition-all transform hover:scale-105"
              >
                PLAY AGAIN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
