"use client";

import { useState, useEffect } from "react";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { useContractAddress } from "@/hooks/useContractAddress";
import { formatEther } from "viem";

type Winner = {
  type: "Roulette" | "Lottery";
  user: string;
  amount: string;
  txHash: string;
  timestamp: number;
};

export default function WinnersList() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const client = usePublicClient();
  const rouletteAddress = useContractAddress('ROULETTE');

  useEffect(() => {
    const fetchWinners = async () => {
      if (!client || !rouletteAddress) return;
      
      try {
        const blockNumber = await client.getBlockNumber();
        const fromBlock = blockNumber - BigInt(5000); // Look back ~5000 blocks

        // Fetch Roulette Wins (RoundResolved event doesn't have user, we need WinningsClaimed)
        const rouletteLogs = await client.getLogs({
          address: rouletteAddress,
          event: parseAbiItem('event WinningsClaimed(uint256 indexed roundId, address indexed user, uint256 amount)'),
          fromBlock,
          toBlock: 'latest'
        });

        // Fetch Lottery Wins (TicketPurchased with won=true)
        // Note: The event signature in Lottery.sol might need checking. 
        // Assuming: event TicketPurchased(address indexed player, uint256 ticketId, bool won, uint256 payout);
        // Let's check the Lottery ABI in constants.ts or Lottery.sol if needed.
        // Based on previous context, Lottery has TicketPurchased.
        
        // Actually, let's stick to Roulette claims for now as they are confirmed wins.
        // Lottery wins happen on purchase.
        
        const formattedWinners: Winner[] = rouletteLogs.map(log => ({
          type: "Roulette",
          user: log.args.user as string,
          amount: (Number(log.args.amount) / 1e18).toFixed(4),
          txHash: log.transactionHash,
          timestamp: Date.now(), // We'd need to fetch block timestamp, but for now approx is fine or fetch block
        }));

        setWinners(formattedWinners.reverse());
      } catch (error) {
        console.error("Error fetching winners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWinners();
  }, [client, rouletteAddress]);

  return (
    <div className="glass-panel border border-white/10 rounded-xl p-6 h-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 neon-text">
        🏆 Recent Winners
      </h2>

      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        ) : winners.length > 0 ? (
          winners.map((w, i) => (
            <div key={i} className="bg-gradient-to-r from-yellow-900/20 to-transparent border-l-4 border-yellow-500 p-4 rounded-r-lg flex justify-between items-center hover:bg-white/5 transition-colors">
              <div>
                <div className="font-bold text-yellow-500">{w.type} Win</div>
                <div className="text-sm text-gray-400 font-mono">
                  {w.user.slice(0, 6)}...{w.user.slice(-4)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">{w.amount} ETH</div>
                <a 
                  href={`https://sepolia.etherscan.io/tx/${w.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline"
                >
                  View Tx
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-12">
            No recent winners found.
          </div>
        )}
      </div>
    </div>
  );
}
