"use client";

import { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { SUGGESTIONS_ABI } from "@/constants";
import { useContractAddress } from "@/hooks/useContractAddress";
import { useIsMounted } from "@/hooks/useIsMounted";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function SuggestionsBoard() {
  const { isConnected } = useAccount();
  const isMounted = useIsMounted();
  const suggestionsAddress = useContractAddress('SUGGESTIONS');
  const [message, setMessage] = useState("");

  const { data: suggestions, refetch } = useReadContract({
    address: suggestionsAddress,
    abi: SUGGESTIONS_ABI,
    functionName: "getSuggestions",
  });

  const { writeContract: post, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setMessage("");
      refetch();
    }
  }, [isSuccess, refetch]);

  const handlePost = () => {
    if (!suggestionsAddress) return;
    if (!message.trim()) return;
    post({
      address: suggestionsAddress,
      abi: SUGGESTIONS_ABI,
      functionName: "postSuggestion",
      args: [message],
    });
  };

  return (
    <div className="glass-panel border border-white/10 rounded-xl p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 neon-text">
        💬 Community Board
      </h2>

      {/* Input Area */}
      <div className="mb-8">
        {!isConnected ? (
          <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
            <p className="text-gray-400 mb-4">Connect wallet to post suggestions</p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your suggestion or say hello..."
              maxLength={280}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-32"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{message.length}/280</span>
              <button
                onClick={handlePost}
                disabled={!message.trim() || isPending}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20"
              >
                {isPending ? "Posting..." : "Post Message"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[600px] custom-scrollbar">
        {suggestions && [...suggestions].reverse().map((s, i) => (
          <div key={i} className="glass-card border border-white/5 p-4 rounded-lg hover:border-white/20 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-500/20">
                {s.user.slice(0, 6)}...{s.user.slice(-4)}
              </span>
              <span className="text-xs text-gray-500">
                {isMounted ? new Date(Number(s.timestamp) * 1000).toLocaleDateString() : ''}
              </span>
            </div>
            <p className="text-gray-300 break-words">{s.message}</p>
          </div>
        ))}
        {(!suggestions || suggestions.length === 0) && (
          <div className="text-center text-gray-500 py-12">
            No messages yet. Be the first to post!
          </div>
        )}
      </div>
    </div>
  );
}
