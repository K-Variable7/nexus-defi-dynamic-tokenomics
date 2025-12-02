"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, decodeEventLog } from 'viem';
import { useSearchParams } from 'next/navigation';
import { ERC20_ABI } from '../constants';
import { LOTTERY_ABI } from '../abis';
import { useContractAddress } from '../hooks/useContractAddress';
import LotteryGame from './LotteryGame';

function LotteryContent() {
  const { address } = useAccount();
  const lotteryAddress = useContractAddress('LOTTERY');
  const tokenAddress = useContractAddress('TOKEN');
  const searchParams = useSearchParams();
  const referrer = searchParams.get('ref');
  
  const [isApproved, setIsApproved] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: ticketPrice } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: 'ticketPrice',
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: (address && lotteryAddress) ? [address, lotteryAddress] : undefined,
  });

  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: play, data: playHash, isPending: isPlaying } = useWriteContract();

  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isPlayLoading, isSuccess: isPlaySuccess, data: playReceipt } = useWaitForTransactionReceipt({
    hash: playHash,
  });

  useEffect(() => {
    if (allowance && ticketPrice) {
      setIsApproved(allowance >= ticketPrice);
    }
  }, [allowance, ticketPrice]);

  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isPlaySuccess && playReceipt) {
      console.log("Transaction successful, parsing logs...", playReceipt);
      // Find the TicketPurchased event
      const event = playReceipt.logs.map(log => {
        try {
          return decodeEventLog({
            abi: LOTTERY_ABI,
            data: log.data,
            topics: log.topics,
          });
        } catch (e) {
          return null;
        }
      }).find((e: any) => e?.eventName === 'TicketPurchased');

      if (event) {
        console.log("Event found:", event);
        const won = (event.args as any).won;
        setGameResult(won ? 'win' : 'loss');
      } else {
        console.error("TicketPurchased event not found!");
      }
    }
  }, [isPlaySuccess, playReceipt]);

  const handleApprove = () => {
    if (!ticketPrice || !tokenAddress || !lotteryAddress) return;
    approve({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [lotteryAddress, ticketPrice * BigInt(100)], // Approve for 100 rounds
      gas: BigInt(100000),
    });
  };

  const handlePlay = () => {
    if (!lotteryAddress) return;
    setGameResult(null);
    const refAddress = (referrer && referrer.startsWith('0x')) ? referrer as `0x${string}` : '0x0000000000000000000000000000000000000000';
    
    play({
      address: lotteryAddress,
      abi: LOTTERY_ABI,
      functionName: 'play',
      args: [refAddress],
      gas: BigInt(500000),
    });
  };

  const copyReferral = () => {
    if (!address) return;
    const url = `${window.location.origin}?ref=${address}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 glass-panel rounded-xl relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-purple-400 neon-text">🎰 Nexus Lottery</h2>
        {address && (
            <button 
                onClick={copyReferral}
                className="text-xs bg-purple-900/50 hover:bg-purple-900 text-purple-300 px-2 py-1 rounded border border-purple-700 transition-colors"
            >
                {copied ? 'Copied!' : '🔗 Copy Referral'}
            </button>
        )}
      </div>
      
      <div className="mb-6 text-gray-300">
        <p>Ticket Price: <span className="font-mono text-white">{ticketPrice ? formatEther(ticketPrice) : '...'} NEX</span></p>
        <p className="text-sm text-gray-400 mt-1">Win Chance: 20% (Pays 50% of Pot)</p>
        {referrer && <p className="text-xs text-green-400 mt-1">Referral Active: Supporting {referrer.slice(0,6)}...</p>}
      </div>

      <LotteryGame
        isPlaying={isPlaying || isPlayLoading}
        gameResult={gameResult}
        onPlay={handlePlay}
        isApproved={isApproved}
        isApproving={isApproving || isApproveLoading}
        onApprove={handleApprove}
        ticketPrice={ticketPrice ? formatEther(ticketPrice) : '...'}
      />
    </div>
  );
}

export default function LotteryCard() {
  return (
    <Suspense fallback={<div className="p-6 glass-panel rounded-xl animate-pulse h-64"></div>}>
      <LotteryContent />
    </Suspense>
  );
}
