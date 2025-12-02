import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useIsMounted } from '../hooks/useIsMounted';
import { LIQUIDITY_LOCKER_ABI, ERC20_ABI } from '../constants';
import { useContractAddress } from '../hooks/useContractAddress';

const DURATIONS = [
  { label: 'No Lock (1x)', value: 0, multiplier: 100 },
  { label: '1 Month (1.25x)', value: 1, multiplier: 125 },
  { label: '3 Months (1.5x)', value: 2, multiplier: 150 },
  { label: '6 Months (2x)', value: 3, multiplier: 200 },
  { label: '1 Year (4x)', value: 4, multiplier: 400 },
];

export default function LiquidityLocker() {
  const { address } = useAccount();
  const isMounted = useIsMounted();
  const liquidityLockerAddress = useContractAddress('LIQUIDITY_LOCKER');
  const mockLpAddress = useContractAddress('MOCK_LP');

  const [amount, setAmount] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [isApproved, setIsApproved] = useState(false);

  // Contract Reads
  const { data: userLocks, refetch: refetchLocks } = useReadContract({
    address: liquidityLockerAddress,
    abi: LIQUIDITY_LOCKER_ABI,
    functionName: 'getUserLocks',
    args: address ? [address] : undefined,
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: mockLpAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: (address && liquidityLockerAddress) ? [address, liquidityLockerAddress] : undefined,
  });

  const { data: balance } = useReadContract({
    address: mockLpAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Contract Writes
  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: deposit, data: depositHash, isPending: isDepositing } = useWriteContract();
  const { writeContract: withdraw, data: withdrawHash, isPending: isWithdrawing } = useWriteContract();
  const { writeContract: claim, data: claimHash, isPending: isClaiming } = useWriteContract();

  // Transaction Waiters
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });
  const { isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  // Effects
  useEffect(() => {
    if (isApproveSuccess) refetchAllowance();
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isDepositSuccess || isWithdrawSuccess || isClaimSuccess) {
      refetchLocks();
    }
  }, [isDepositSuccess, isWithdrawSuccess, isClaimSuccess, refetchLocks]);

  useEffect(() => {
    if (allowance && amount) {
      try {
        setIsApproved(allowance >= parseEther(amount));
      } catch {
        setIsApproved(false);
      }
    }
  }, [allowance, amount]);

  // Handlers
  const handleApprove = () => {
    if (!amount || !mockLpAddress || !liquidityLockerAddress) return;
    approve({
      address: mockLpAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [liquidityLockerAddress, parseEther(amount)],
    });
  };

  const handleDeposit = () => {
    if (!amount || !liquidityLockerAddress) return;
    deposit({
      address: liquidityLockerAddress,
      abi: LIQUIDITY_LOCKER_ABI,
      functionName: 'deposit',
      args: [parseEther(amount), selectedDuration],
    });
  };

  const handleWithdraw = (index: number) => {
    if (!liquidityLockerAddress) return;
    withdraw({
      address: liquidityLockerAddress,
      abi: LIQUIDITY_LOCKER_ABI,
      functionName: 'withdraw',
      args: [BigInt(index)],
    });
  };

  const handleClaim = (index: number) => {
    if (!liquidityLockerAddress) return;
    claim({
      address: liquidityLockerAddress,
      abi: LIQUIDITY_LOCKER_ABI,
      functionName: 'claim',
      args: [BigInt(index)],
    });
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Liquidity Locker</h2>
      
      {/* Deposit Section */}
      <div className="mb-8 p-6 glass-card rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Lock Liquidity</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount (MockLP)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-black/50 rounded p-2 border border-white/10 focus:border-blue-500 outline-none"
                placeholder="0.0"
              />
              <button 
                onClick={() => balance && setAmount(formatEther(balance))}
                className="px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-sm border border-white/5"
              >
                Max
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Balance: {balance ? formatEther(balance) : '0'} LP
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Lock Duration</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {DURATIONS.map((dur) => (
                <button
                  key={dur.value}
                  onClick={() => setSelectedDuration(dur.value)}
                  className={`p-2 rounded text-sm transition-colors border ${
                    selectedDuration === dur.value
                      ? 'bg-blue-600/80 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                      : 'bg-black/40 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2">
            {!isApproved ? (
              <button
                onClick={handleApprove}
                disabled={isApproving || !amount}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
              >
                {isApproving ? 'Approving...' : 'Approve LP'}
              </button>
            ) : (
              <button
                onClick={handleDeposit}
                disabled={isDepositing || !amount}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/20"
              >
                {isDepositing ? 'Lock Liquidity' : 'Lock & Earn'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Locks */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Your Locks</h3>
        {!userLocks || userLocks.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No active locks found.</p>
        ) : (
          <div className="space-y-4">
            {userLocks.map((lock: any, index: number) => {
              const unlockDate = new Date(Number(lock.unlockDate) * 1000);
              const isLocked = isMounted ? Date.now() < unlockDate.getTime() : true;
              
              return (
                <div key={index} className="p-4 glass-card rounded-lg border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-lg font-bold">{formatEther(lock.amount)} LP</p>
                      <p className="text-sm text-gray-400">
                        Multiplier: {(Number(lock.multiplier) / 100).toFixed(2)}x
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isLocked ? 'text-yellow-400' : 'text-green-400'}`}>
                        {isLocked ? 'Locked' : 'Unlocked'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ends: {isMounted ? unlockDate.toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClaim(index)}
                      disabled={isClaiming}
                      className="flex-1 py-2 bg-indigo-600/80 hover:bg-indigo-600 rounded text-sm font-semibold disabled:opacity-50 border border-indigo-500/30"
                    >
                      {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                    </button>
                    <button
                      onClick={() => handleWithdraw(index)}
                      disabled={isWithdrawing}
                      className={`flex-1 py-2 rounded text-sm font-semibold disabled:opacity-50 border ${
                        isLocked 
                          ? 'bg-red-900/20 text-red-200 hover:bg-red-900/40 border-red-500/30' 
                          : 'bg-white/10 hover:bg-white/20 border-white/10'
                      }`}
                    >
                      {isWithdrawing ? 'Withdrawing...' : isLocked ? 'Withdraw (Penalty)' : 'Withdraw'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
