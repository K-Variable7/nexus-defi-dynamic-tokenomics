// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VariableTaxToken.sol";

interface IRouterForBuy {
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable;
    function WETH() external pure returns (address);
}

contract BuyTokens is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address tokenAddress = 0x7784fF80C9D58686956428352734A8a28637B84C;
        address routerAddress = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;

        IRouterForBuy router = IRouterForBuy(routerAddress);
        address weth = router.WETH();

        vm.startBroadcast(deployerPrivateKey);

        address[] memory path = new address[](2);
        path[0] = weth;
        path[1] = tokenAddress;

        console.log("Buying Tokens with 0.001 ETH...");

        router.swapExactETHForTokensSupportingFeeOnTransferTokens{
            value: 0.001 ether
        }(0, path, deployer, block.timestamp + 300);

        console.log("Buy Successful");

        vm.stopBroadcast();
    }
}
