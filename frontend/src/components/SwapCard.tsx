'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ROUTER_ABI, ERC20_ABI } from '../constants';
import { useContractAddress } from '../hooks/useContractAddress';

export default function SwapCard() {
  const { address, isConnected } = useAccount();
  const routerAddress = useContractAddress('ROUTER');
  const tokenAddress = useContractAddress('TOKEN');
  const wethAddress = useContractAddress('WETH');

  const [isBuying, setIsBuying] = useState(true);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Balances
  const { data: ethBalance } = useBalance({ address });
  const { data: tokenBalance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Quote
  const path = (wethAddress && tokenAddress) 
    ? (isBuying ? [wethAddress, tokenAddress] : [tokenAddress, wethAddress]) as [`0x${string}`, `0x${string}`]
    : undefined;

  const { data: amountsOut, isLoading: isQuoteLoading } = useReadContract({
    address: routerAddress,
    abi: ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: (amountIn && parseFloat(amountIn) > 0 && path)
      ? [parseEther(amountIn), path] 
      : undefined,
    query: {
      enabled: !!amountIn && parseFloat(amountIn) > 0 && !!path,
    }
  });

  useEffect(() => {
    if (amountsOut && amountsOut[1]) {
      setAmountOut(formatEther(amountsOut[1]));
    } else {
      setAmountOut('');
    }
  }, [amountsOut]);

  // Allowance (only for selling)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: (address && routerAddress) ? [address, routerAddress] : undefined,
    query: {
      enabled: !isBuying && !!address,
    }
  });

  // Write Contracts
  const { writeContract: writeApprove, data: approveTxHash, isPending: isApprovePending } = useWriteContract();
  const { writeContract: writeSwap, data: swapTxHash, isPending: isSwapPending } = useWriteContract();

  // Wait for Tx
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });
  const { isLoading: isSwapConfirming, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({
    hash: swapTxHash,
  });

  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
      setIsApproving(false);
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isSwapSuccess) {
      setAmountIn('');
      setAmountOut('');
    }
  }, [isSwapSuccess]);

  const handleApprove = () => {
    if (!amountIn || !tokenAddress || !routerAddress) return;
    setIsApproving(true);
    writeApprove({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [routerAddress, parseEther(amountIn)],
    });
  };

    const handleSwap = () => {
    if (!amountIn || !amountsOut || !routerAddress || !path) return;
    
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 mins
    const amountOutMin = (amountsOut[1] * BigInt(95)) / BigInt(100); // 5% slippage tolerance

    if (isBuying) {
      writeSwap({
        address: routerAddress,
        abi: ROUTER_ABI,
        functionName: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
        args: [amountOutMin, path, address!, deadline],
        value: parseEther(amountIn),
      });
    } else {
      writeSwap({
        address: routerAddress,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
        args: [parseEther(amountIn), amountOutMin, path, address!, deadline],
      });
    }
  };

  const needsApproval = !isBuying && allowance !== undefined && amountIn && allowance < parseEther(amountIn);

  return (
    <div className="glass-panel p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Instant Swap</h2>
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
          <button
            onClick={() => setIsBuying(true)}
            className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
              isBuying ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setIsBuying(false)}
            className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
              !isBuying ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            You Pay ({isBuying ? 'ETH' : 'NEX'})
          </label>
          <div className="relative">
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="0.0"
            />
            <span className="absolute right-4 top-3 text-gray-500 text-sm">
              Balance: {isBuying 
                ? (ethBalance ? parseFloat(formatEther(ethBalance.value)).toFixed(4) : '0.00')
                : (tokenBalance ? parseFloat(formatEther(tokenBalance as bigint)).toFixed(4) : '0.00')
              }
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="bg-white/5 p-2 rounded-full border border-white/10">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            You Receive ({isBuying ? 'NEX' : 'ETH'})
          </label>
          <div className="relative">
            <input
              type="text"
              value={isQuoteLoading ? 'Fetching...' : amountOut}
              readOnly
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none cursor-not-allowed"
              placeholder="0.0"
            />
          </div>
        </div>

        {needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={isApprovePending || isApproveConfirming}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
          >
            {isApprovePending || isApproveConfirming ? 'Approving...' : 'Approve NEX'}
          </button>
        ) : (
          <button
            onClick={handleSwap}
            disabled={!isConnected || !amountIn || isSwapPending || isSwapConfirming}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
          >
            {!isConnected 
              ? 'Connect Wallet' 
              : isSwapPending || isSwapConfirming 
                ? 'Swapping...' 
                : 'Swap Tokens'}
          </button>
        )}
      </div>
    </div>
  );
}
