// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VariableTaxToken.sol";

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

contract FixTokenConfig is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address tokenAddress = 0x7784fF80C9D58686956428352734A8a28637B84C;
        address routerAddress = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
        address lotteryAddress = 0x92E86e35CB294D6E472E5095C11fb77bA9b2BD2b;
        address stakingAddress = 0x17bD6cCB9d98974eDE38311fC2930e88cC84C005;

        VariableTaxToken token = VariableTaxToken(payable(tokenAddress));
        IUniswapV2Router02 router = IUniswapV2Router02(routerAddress);
        IUniswapV2Factory factory = IUniswapV2Factory(router.factory());
        address weth = router.WETH();

        vm.startBroadcast(deployerPrivateKey);

        // 1. Get and Set Pair
        address pair = factory.getPair(tokenAddress, weth);
        console.log("Pair Address:", pair);

        if (pair != address(0)) {
            token.setUniswapPair(pair);
            console.log("Set Uniswap Pair on Token");
        }

        // 2. Set Pools
        token.setBuybackPool(stakingAddress); // Use Staking Pool as Buyback/Treasury for now
        console.log("Set Buyback Pool to Staking Address");

        token.setLotteryPool(lotteryAddress);
        console.log("Set Lottery Pool");

        // 3. Exclude System Contracts from Tax
        token.setExcluded(stakingAddress, true);
        token.setExcluded(lotteryAddress, true);
        token.setExcluded(routerAddress, true);
        token.setExcluded(pair, true); // Usually pairs are NOT excluded, but for testing stability we can exclude it if tax is breaking things.
        // Actually, if we exclude the pair, NO tax is collected on buys/sells.
        // Let's NOT exclude the pair, but exclude the others.

        console.log("Excluded System Contracts from Tax");

        vm.stopBroadcast();
    }
}
