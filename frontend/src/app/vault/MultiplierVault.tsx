"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { MULTIPLIER_VAULT_ABI } from "@/constants";
import { useContractAddress } from "@/hooks/useContractAddress";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";

const TEAMS = [
  { id: 0, name: "Red Team", color: "from-red-500 to-orange-500", bg: "bg-red-900/20", border: "border-red-500/50" },
  { id: 1, name: "Blue Team", color: "from-blue-500 to-cyan-500", bg: "bg-blue-900/20", border: "border-blue-500/50" },
  { id: 2, name: "Green Team", color: "from-green-500 to-emerald-500", bg: "bg-green-900/20", border: "border-green-500/50" },
];

export default function MultiplierVault() {
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const referrer = searchParams.get('ref') || "0x0000000000000000000000000000000000000000";
  
  const vaultAddress = useContractAddress('VAULT');
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined' && address) {
      setReferralLink(`${window.location.origin}/vault?ref=${address}`);
    }
  }, [address]);

  // Read current round info
  const { data: currentRoundId } = useReadContract({
    address: vaultAddress,
    abi: MULTIPLIER_VAULT_ABI,
    functionName: "currentRoundId",
    query: { refetchInterval: 2000 }
  });

  const { data: roundInfo, refetch: refetchRound } = useReadContract({
    address: vaultAddress,
    abi: MULTIPLIER_VAULT_ABI,
    functionName: "getRound",
    args: currentRoundId ? [currentRoundId] : undefined,
    query: { enabled: !!currentRoundId, refetchInterval: 2000 }
  });

  const { data: teamPools } = useReadContract({
    address: vaultAddress,
    abi: MULTIPLIER_VAULT_ABI,
    functionName: "getTeamPools",
    args: currentRoundId ? [currentRoundId] : undefined,
    query: { enabled: !!currentRoundId, refetchInterval: 2000 }
  });

  const { data: userDepositData } = useReadContract({
    address: vaultAddress,
    abi: MULTIPLIER_VAULT_ABI,
    functionName: "userDeposits",
    args: (currentRoundId && address) ? [currentRoundId, address] : undefined,
    query: { enabled: !!currentRoundId && !!address, refetchInterval: 2000 }
  });
  const userDeposit = userDepositData as bigint | undefined;

  const { data: userTeam } = useReadContract({
    address: vaultAddress,
    abi: MULTIPLIER_VAULT_ABI,
    functionName: "userTeams",
    args: (currentRoundId && address) ? [currentRoundId, address] : undefined,
    query: { enabled: !!currentRoundId && !!address, refetchInterval: 2000 }
  });

  // Previous Round Logic (for claiming)
  const cRoundId = currentRoundId as bigint | undefined;
  const prevRoundId = cRoundId && cRoundId > 1n ? cRoundId - 1n : undefined;

  const { data: prevUserDepositData } = useReadContract({
    address: vaultAddress,
    abi: MULTIPLIER_VAULT_ABI,
    functionName: "userDeposits",
    args: (prevRoundId && address) ? [prevRoundId, address] : undefined,
    query: { enabled: !!prevRoundId && !!address, refetchInterval: 2000 }
  });
  const prevUserDeposit = prevUserDepositData as bigint | undefined;

  const { data: prevRoundInfo } = useReadContract({
    address: vaultAddress,
    abi: MULTIPLIER_VAULT_ABI,
    functionName: "getRound",
    args: prevRoundId ? [prevRoundId] : undefined,
    query: { enabled: !!prevRoundId, refetchInterval: 2000 }
  });

  const { data: prevUserTeam } = useReadContract({
    address: vaultAddress,
    abi: MULTIPLIER_VAULT_ABI,
    functionName: "userTeams",
    args: (prevRoundId && address) ? [prevRoundId, address] : undefined,
    query: { enabled: !!prevRoundId && !!address, refetchInterval: 2000 }
  });

  // Write contracts
  const { writeContract: deposit, data: depositHash, isPending: isDepositPending, isError: isDepositError } = useWriteContract();
  const { writeContract: closeRound, data: closeHash, isPending: isClosePending } = useWriteContract();
  const { writeContract: claim, data: claimHash, isPending: isClaimPending } = useWriteContract();

  const { isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isSuccess: isCloseSuccess } = useWaitForTransactionReceipt({ hash: closeHash });
  const { isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  useEffect(() => {
    if (isDepositSuccess || isCloseSuccess || isClaimSuccess) {
      refetchRound();
    }
  }, [isDepositSuccess, isCloseSuccess, isClaimSuccess, refetchRound]);

  // Sync selected team if user already has a team
  useEffect(() => {
    if (userDeposit && userDeposit > 0n && userTeam !== undefined) {
      setSelectedTeam(userTeam as number);
    }
  }, [userDeposit, userTeam]);

  // Timer Logic
  useEffect(() => {
    if (!roundInfo) return;
    const { endTime } = roundInfo as any;
    
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(endTime) - now;
      
      if (diff <= 0) {
        setTimeLeft("Ready to Close");
      } else {
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [roundInfo]);

  const handleDeposit = () => {
    const teamToDepositTo = (userDeposit && userDeposit > 0n) ? userTeam : selectedTeam;
    if (!vaultAddress) return;
    if (!depositAmount || teamToDepositTo === null || teamToDepositTo === undefined) return;
    
    deposit({
      address: vaultAddress,
      abi: MULTIPLIER_VAULT_ABI,
      functionName: "deposit",
      args: [teamToDepositTo, referrer],
      value: parseEther(depositAmount),
      gas: 500000n
    });
  };

  const handleClose = () => {
    if (!vaultAddress) return;
    closeRound({
      address: vaultAddress,
      abi: MULTIPLIER_VAULT_ABI,
      functionName: "closeRound",
      gas: 500000n
    });
  };

  const handleClaim = () => {
    if (!vaultAddress) return;
    if (!currentRoundId) return;
    claim({
      address: vaultAddress,
      abi: MULTIPLIER_VAULT_ABI,
      functionName: "claim",
      args: [currentRoundId],
      gas: 500000n
    });
  };

  const handleClaimPrevious = () => {
    if (!vaultAddress) return;
    if (!prevRoundId) return;
    claim({
      address: vaultAddress,
      abi: MULTIPLIER_VAULT_ABI,
      functionName: "claim",
      args: [prevRoundId],
      gas: 500000n
    });
  };

  if (!isConnected) return <div className="flex justify-center p-10"><ConnectButton /></div>;
  if (!roundInfo) return <div className="text-center text-gray-400">Loading Vault...</div>;

  const { id, endTime, totalPool, isClosed, isResolved, randomWord, winningTeam, bonusAmount } = roundInfo as any;
  const isTimeUp = timeLeft === "Ready to Close";
  const currentTeam = userDeposit && userDeposit > 0n ? userTeam : selectedTeam;

  // Previous round data
  const prevInfo = prevRoundInfo as any;
  const showClaimPrevious = prevUserDeposit && prevUserDeposit > 0n && prevInfo && prevInfo.isResolved && prevUserTeam === prevInfo.winningTeam;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pt-24">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">
          Team <span className="neon-text text-pink-500">Vault Battle</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Join a Team. Deposit ETH. Winning Team takes <span className="text-purple-400 font-bold">ALL</span> the pot!
        </p>
      </div>

      {/* Claim Previous Round Banner */}
      {showClaimPrevious && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border-green-500/50 p-6 rounded-2xl flex justify-between items-center"
        >
          <div>
            <h3 className="text-xl font-bold text-green-400">Unclaimed Winnings Found!</h3>
            <p className="text-gray-300">
              Round #{prevRoundId?.toString()} ended. 
              Winning Team: <span className={`font-bold ${TEAMS[prevInfo.winningTeam]?.color.split(' ')[1].replace('to-', 'text-')}`}>{TEAMS[prevInfo.winningTeam]?.name}</span>
            </p>
          </div>
          <button
            onClick={handleClaimPrevious}
            disabled={isClaimPending}
            className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-green-900/20"
          >
            {isClaimPending ? "Claiming..." : "Claim Now"}
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Cards */}
        {TEAMS.map((team) => {
          const pool = teamPools ? (teamPools as any)[team.id] : 0n;
          const isSelected = currentTeam === team.id;
          const isWinner = isResolved && winningTeam === team.id;

          return (
            <motion.div
              key={team.id}
              whileHover={{ scale: 1.02 }}
              className={`relative p-6 rounded-2xl border ${team.border} ${team.bg} backdrop-blur-sm transition-all
                ${isSelected ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'opacity-80 hover:opacity-100'}
                ${(!userDeposit || userDeposit === 0n) ? 'cursor-pointer' : 'cursor-default'}
              `}
              onClick={() => {
                if (!userDeposit || userDeposit === 0n) {
                  setSelectedTeam(team.id);
                }
              }}
            >
              {isWinner && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-bold px-4 py-1 rounded-full shadow-lg animate-bounce">
                  WINNER! 🏆
                </div>
              )}
              <div className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${team.color}`}>
                {team.name}
              </div>
              <div className="mt-4 text-3xl font-bold text-white">
                {formatEther(pool)} ETH
              </div>
              <div className="text-sm text-gray-400">Team Pool</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Card */}
        <div className="glass-panel p-8 rounded-2xl space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Round #{id.toString()}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              isResolved ? "bg-green-900/50 text-green-400 border border-green-500/30" : 
              isClosed ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30" : 
              "bg-blue-900/50 text-blue-400 border border-blue-500/30"
            }`}>
              {isResolved ? "Resolved" : isClosed ? "Calculating..." : "Open"}
            </span>
          </div>

          <div className="text-center py-8">
            <div className="text-sm text-gray-400 mb-2">Total Pool</div>
            <div className="text-4xl font-bold text-white">{formatEther(totalPool)} ETH</div>
            <div className="text-sm text-purple-400 mt-2">
              Winner Pool: {formatEther(totalPool * 95n / 100n)} ETH <span className="text-xs text-gray-500">(5% Fee)</span>
            </div>
          </div>

          <div className="flex justify-between text-sm border-t border-white/10 pt-4">
            <span className="text-gray-400">Time Remaining:</span>
            <span className="font-mono font-bold text-white">{timeLeft}</span>
          </div>
        </div>

        {/* Action Card */}
        <div className="glass-panel p-8 rounded-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-gray-400 text-sm">Your Deposit</label>
            <div className="text-2xl font-bold text-white">
              {userDeposit ? formatEther(userDeposit) : "0.0"} ETH
            </div>
            {userDeposit && userDeposit > 0n && (
               <div className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${TEAMS[userTeam as number]?.color}`}>
                 You are on {TEAMS[userTeam as number]?.name}
               </div>
            )}
          </div>

          {!isClosed && !isResolved && !isTimeUp && (
            <div className="space-y-4">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none backdrop-blur-sm"
                placeholder="Amount in ETH"
              />
              <button
                onClick={handleDeposit}
                disabled={isDepositPending || (selectedTeam === null && (!userDeposit || userDeposit === 0n))}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-900/20"
              >
                {isDepositPending ? "Depositing..." : (selectedTeam === null && (!userDeposit || userDeposit === 0n)) ? "Select a Team" : "Deposit to Team"}
              </button>
              {isDepositError && <div className="text-red-500 text-sm text-center">Transaction failed. Check wallet.</div>}
            </div>
          )}

          {isTimeUp && !isClosed && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-xl text-center text-yellow-200">
                Round Ended. Deposits are closed.
              </div>
              <button
                onClick={handleClose}
                disabled={isClosePending}
                className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-bold text-white transition-all"
              >
                {isClosePending ? "Closing..." : "Close Round & Pick Winner"}
              </button>
            </div>
          )}

          {isResolved && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm text-gray-400">Winning Team</div>
                <div className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${TEAMS[winningTeam]?.color}`}>
                  {TEAMS[winningTeam]?.name}
                </div>
              </div>
              <button
                onClick={handleClaim}
                disabled={isClaimPending || userDeposit === 0n}
                className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white shadow-lg shadow-green-900/20"
              >
                {isClaimPending ? "Claiming..." : "Claim Winnings"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Referral Card */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">🤝 Earn 2% Referral Rewards</h3>
          <p className="text-gray-400 text-sm">Share your link. Earn 2% of every deposit instantly.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            readOnly 
            value={referralLink} 
            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 w-full md:w-64 text-gray-300 text-sm"
          />
          <button 
            onClick={() => navigator.clipboard.writeText(referralLink)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
