import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { STAKING_POOL_ABI, NFT_ABI, ERC20_ABI } from '../constants';
import { useContractAddress } from '../hooks/useContractAddress';

export default function StakingCard() {
  const { address } = useAccount();
  const stakingPoolAddress = useContractAddress('STAKING');
  const nftAddress = useContractAddress('NFT');
  const tokenAddress = useContractAddress('TOKEN');

  const [stakeAmount, setStakeAmount] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  // Staking Data
  const { data: stakeData, refetch: refetchStake } = useReadContract({
    address: stakingPoolAddress,
    abi: STAKING_POOL_ABI,
    functionName: 'stakes',
    args: address ? [address] : undefined,
  });

  const { data: pendingReward, refetch: refetchReward } = useReadContract({
    address: stakingPoolAddress,
    abi: STAKING_POOL_ABI,
    functionName: 'pendingReward',
    args: address ? [address] : undefined,
  });

  const { data: boostMultiplier, refetch: refetchBoost } = useReadContract({
    address: stakingPoolAddress,
    abi: STAKING_POOL_ABI,
    functionName: 'getBoostMultiplier',
    args: address ? [address] : undefined,
  });

  // NFT Data
  const { data: goldPrice } = useReadContract({ address: nftAddress, abi: NFT_ABI, functionName: 'goldPrice' });
  const { data: platinumPrice } = useReadContract({ address: nftAddress, abi: NFT_ABI, functionName: 'platinumPrice' });
  const { data: diamondPrice } = useReadContract({ address: nftAddress, abi: NFT_ABI, functionName: 'diamondPrice' });

  const { data: userTiers, refetch: refetchTiers } = useReadContract({
    address: nftAddress,
    abi: NFT_ABI,
    functionName: 'getUserTiers',
    args: address ? [address] : undefined,
  });

  // Token Allowance & Balance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: (address && stakingPoolAddress) ? [address, stakingPoolAddress] : undefined,
  });

  const { data: tokenBalance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Actions
  const { writeContract: stake, isPending: isStaking } = useWriteContract();
  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: claim, isPending: isClaiming } = useWriteContract();
  const { writeContract: mintNft, isPending: isMinting } = useWriteContract();
  const { writeContract: applyBoost, isPending: isApplyingBoost } = useWriteContract();

  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  useEffect(() => {
    if (isApproveSuccess) refetchAllowance();
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (allowance && stakeAmount) {
      try {
        setIsApproved(allowance >= parseEther(stakeAmount));
      } catch {
        setIsApproved(false);
      }
    }
  }, [allowance, stakeAmount]);

  const handleStake = () => {
    if (!stakeAmount || !stakingPoolAddress) return;
    stake({
      address: stakingPoolAddress,
      abi: STAKING_POOL_ABI,
      functionName: 'stake',
      args: [parseEther(stakeAmount)],
    });
  };

  const handleApprove = () => {
    if (!stakeAmount || !tokenAddress || !stakingPoolAddress) return;
    approve({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [stakingPoolAddress, parseEther(stakeAmount)],
    });
  };

  const handlePercentage = (percent: number) => {
    if (!tokenBalance) return;
    const amount = (tokenBalance * BigInt(percent)) / BigInt(100);
    setStakeAmount(formatEther(amount));
  };

  const handleMint = (tier: number, price: bigint) => {
    if (!nftAddress) return;
    mintNft({
      address: nftAddress,
      abi: NFT_ABI,
      functionName: 'mint',
      args: [tier],
      value: price,
    });
  };

  const handleClaim = () => {
    if (!stakingPoolAddress) return;
    claim({
      address: stakingPoolAddress,
      abi: STAKING_POOL_ABI,
      functionName: 'claimReward',
    });
  };

  const handleApplyBoost = () => {
    if (!stakingPoolAddress) return;
    applyBoost({
      address: stakingPoolAddress,
      abi: STAKING_POOL_ABI,
      functionName: 'applyBoost',
    });
  };

  const stakedAmount = stakeData ? formatEther(stakeData[0]) : '0';
  const earnedEth = pendingReward ? formatEther(pendingReward) : '0';
  const currentBoost = Number(boostMultiplier || 100) - 100;

  const [hasGold, hasPlatinum, hasDiamond] = userTiers || [false, false, false];

  return (
    <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2 text-white">Staking Pool</h3>
            <p className="text-gray-400 text-sm">Earn ETH dividends from platform volume.</p>
          </div>
          {currentBoost > 0 && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              ⚡ {currentBoost}% BOOST ACTIVE
            </div>
          )}
        </div>

        {/* NFT Minting Section */}
        <div className="grid grid-cols-3 gap-2 mb-6">
            {/* Gold */}
            <button 
                onClick={() => goldPrice && handleMint(1, goldPrice)}
                disabled={isMinting || hasGold}
                className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                    hasGold 
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                    : 'bg-white/5 border-white/10 hover:border-yellow-500/50 text-gray-400 hover:text-yellow-500 hover:bg-white/10'
                }`}
            >
                <span className="font-bold">GOLD</span>
                <span>+25%</span>
                <span className="opacity-70">{goldPrice ? formatEther(goldPrice) : '-'} ETH</span>
                {hasGold && <span className="text-[10px]">OWNED</span>}
            </button>

            {/* Platinum */}
            <button 
                onClick={() => platinumPrice && handleMint(2, platinumPrice)}
                disabled={isMinting || hasPlatinum}
                className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                    hasPlatinum 
                    ? 'bg-slate-400/20 border-slate-400 text-slate-300 shadow-[0_0_10px_rgba(148,163,184,0.2)]' 
                    : 'bg-white/5 border-white/10 hover:border-slate-400/50 text-gray-400 hover:text-slate-300 hover:bg-white/10'
                }`}
            >
                <span className="font-bold">PLATINUM</span>
                <span>+50%</span>
                <span className="opacity-70">{platinumPrice ? formatEther(platinumPrice) : '-'} ETH</span>
                {hasPlatinum && <span className="text-[10px]">OWNED</span>}
            </button>

            {/* Diamond */}
            <button 
                onClick={() => diamondPrice && handleMint(3, diamondPrice)}
                disabled={isMinting || hasDiamond}
                className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                    hasDiamond 
                    ? 'bg-cyan-400/20 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                    : 'bg-white/5 border-white/10 hover:border-cyan-400/50 text-gray-400 hover:text-cyan-400 hover:bg-white/10'
                }`}
            >
                <span className="font-bold">DIAMOND</span>
                <span>+125%</span>
                <span className="opacity-70">{diamondPrice ? formatEther(diamondPrice) : '-'} ETH</span>
                {hasDiamond && <span className="text-[10px]">OWNED</span>}
            </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/50 p-4 rounded-xl border border-white/5">
            <p className="text-gray-400 text-xs mb-1">Staked Balance</p>
            <p className="text-xl font-bold text-white">{Number(stakedAmount).toFixed(2)} NEX</p>
          </div>
          <div className="bg-black/50 p-4 rounded-xl border border-white/5">
            <p className="text-gray-400 text-xs mb-1">Unclaimed ETH</p>
            <p className="text-xl font-bold text-green-400">{Number(earnedEth).toFixed(4)} ETH</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Percentage Buttons */}
          <div className="flex justify-between gap-2 mb-2">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => handlePercentage(percent)}
                className="bg-white/5 hover:bg-white/10 text-xs text-gray-300 py-1 px-2 rounded transition-colors border border-white/5"
              >
                {percent === 100 ? 'MAX' : `${percent}%`}
              </button>
            ))}
          </div>

          {/* Slider */}
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="0"
            onChange={(e) => handlePercentage(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mb-2 accent-blue-500"
          />

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 w-full text-white focus:outline-none focus:border-blue-500"
            />
            {!isApproved ? (
              <button
                onClick={handleApprove}
                disabled={isApproving || !stakeAmount}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 whitespace-nowrap shadow-lg shadow-blue-900/20"
              >
                {isApproving ? 'Approving...' : 'Approve Staking'}
              </button>
            ) : (
              <button
                onClick={handleStake}
                disabled={isStaking || !stakeAmount}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 whitespace-nowrap shadow-lg shadow-purple-900/20"
              >
                {isStaking ? 'Staking...' : 'Stake Tokens'}
              </button>
            )}
          </div>

          <button
            onClick={handleClaim}
            disabled={isClaiming || Number(earnedEth) <= 0}
            className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/50 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {isClaiming ? 'Claiming...' : 'Claim Rewards'}
          </button>
          
          {/* Apply Boost Button */}
          <button
             onClick={handleApplyBoost}
             disabled={isApplyingBoost}
             className="w-full text-xs text-yellow-500 hover:text-yellow-400 underline"
           >
             Sync NFT Boost
           </button>
        </div>
      </div>
    </div>
  );
}
