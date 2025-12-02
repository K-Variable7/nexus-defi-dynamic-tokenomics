// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VariableTaxToken.sol";

interface IUniswapV2Pair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns (address);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

contract CheckState is Script {
    function run() external view {
        address tokenAddress = 0x7784fF80C9D58686956428352734A8a28637B84C;
        address routerAddress = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;

        VariableTaxToken token = VariableTaxToken(payable(tokenAddress));
        IUniswapV2Router02 router = IUniswapV2Router02(routerAddress);
        IUniswapV2Factory factory = IUniswapV2Factory(router.factory());
        address weth = router.WETH();

        console.log("--- Token State ---");
        console.log("Token Address:", tokenAddress);
        console.log("Swap Enabled:", token.swapEnabled());
        console.log("Owner:", token.owner());
        console.log("Team Wallet:", token.teamWallet());
        console.log("Buyback Pool:", token.buybackPool());
        console.log("Lottery Pool:", token.lotteryPool());
        console.log("Swap Threshold:", token.swapThreshold());

        console.log("--- Liquidity State ---");
        address pair = factory.getPair(tokenAddress, weth);
        console.log("Pair Address:", pair);

        if (pair != address(0)) {
            IUniswapV2Pair pairContract = IUniswapV2Pair(pair);
            (uint112 reserve0, uint112 reserve1,) = pairContract.getReserves();
            address token0 = pairContract.token0();

            if (token0 == tokenAddress) {
                console.log("Reserve Token (NEX):", reserve0);
                console.log("Reserve WETH:", reserve1);
            } else {
                console.log("Reserve WETH:", reserve0);
                console.log("Reserve Token (NEX):", reserve1);
            }
        } else {
            console.log("No Pair Found!");
        }
    }
}
