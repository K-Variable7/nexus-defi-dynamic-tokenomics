'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { DAO_ABI } from '../constants';
import { useContractAddress } from '@/hooks/useContractAddress';
import { useIsMounted } from '@/hooks/useIsMounted';
import { formatDistanceToNow } from 'date-fns';
import { formatEther } from 'viem';

interface Proposal {
  id: bigint;
  proposer: string;
  description: string;
  voteCount: bigint;
  deadline: bigint;
  executed: boolean;
  isActive: boolean;
}

export default function GovernanceBoard() {
  const { address } = useAccount();
  const isMounted = useIsMounted();
  const daoAddress = useContractAddress('DAO');
  const [description, setDescription] = useState('');
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: proposals, refetch } = useReadContract({
    address: daoAddress,
    abi: DAO_ABI,
    functionName: 'getProposals',
  });

  useEffect(() => {
    if (isSuccess) {
      setDescription('');
      refetch();
    }
  }, [isSuccess, refetch]);

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!daoAddress) return;
    if (!description) return;
    writeContract({
      address: daoAddress,
      abi: DAO_ABI,
      functionName: 'createProposal',
      args: [description],
    });
  };

  const handleVote = (id: bigint) => {
    if (!daoAddress) return;
    writeContract({
      address: daoAddress,
      abi: DAO_ABI,
      functionName: 'vote',
      args: [id],
    });
  };

  return (
    <div className="glass-panel p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Community Treasury DAO
      </h2>

      {/* Create Proposal Form */}
      <form onSubmit={handleCreateProposal} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Propose an asset to buy (e.g., 'Buy 1000 USDC')"
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors text-white"
            disabled={isPending || isConfirming}
          />
          <button
            type="submit"
            disabled={isPending || isConfirming || !description}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-semibold transition-colors text-white shadow-lg shadow-purple-900/20"
          >
            {isPending || isConfirming ? 'Proposing...' : 'Propose'}
          </button>
        </div>
      </form>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals && [...proposals].reverse().map((proposal: Proposal) => (
          <div 
            key={proposal.id.toString()} 
            className="glass-card rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-lg font-medium text-white mb-1">{proposal.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>Proposed by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                  <span>•</span>
                  <span>Ends {isMounted ? formatDistanceToNow(Number(proposal.deadline) * 1000, { addSuffix: true }) : ''}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                  {Number(formatEther(proposal.voteCount)).toFixed(2)} Votes
                </div>
                {proposal.isActive && (
                  <button
                    onClick={() => handleVote(proposal.id)}
                    disabled={isPending || isConfirming}
                    className="text-sm bg-green-600/20 text-green-400 hover:bg-green-600/30 px-3 py-1 rounded-lg transition-colors border border-green-600/30"
                  >
                    Vote
                  </button>
                )}
              </div>
            </div>
            
            {/* Progress Bar (Visual only for now) */}
            <div className="w-full bg-black/50 rounded-full h-2 mt-2 border border-white/5">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                style={{ width: `${Math.min(Number(formatEther(proposal.voteCount)) / 1000 * 100, 100)}%` }} // Target: 1000 Votes
              />
            </div>
          </div>
        ))}

        {(!proposals || proposals.length === 0) && (
          <div className="text-center text-gray-500 py-8">
            No active proposals. Be the first to propose!
          </div>
        )}
      </div>
    </div>
  );
}
