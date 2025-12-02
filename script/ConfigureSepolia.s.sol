// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VariableTaxToken.sol";

interface IUniswapV2Router02Full {
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);
}

interface IVRFCoordinatorV2 {
    function addConsumer(uint64 subId, address consumer) external;
}

contract ConfigureSepolia is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // --- Configuration ---
        address tokenAddress = 0x7784fF80C9D58686956428352734A8a28637B84C; // Sepolia Token
        address routerAddress = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008; // Sepolia Router
        address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625; // Sepolia VRF Coordinator

        // New Contracts to Authorize
        address rouletteAddress = 0xd05b7919189DfB09904E6183ff062942eDE565B0;
        address vaultAddress = 0xb6C9F61d81C6c6A7827B255d963B43a107f4754b;

        uint64 subscriptionId = uint64(vm.envOr("VRF_SUBSCRIPTION_ID", uint256(12498)));

        VariableTaxToken token = VariableTaxToken(payable(tokenAddress));
        IUniswapV2Router02Full router = IUniswapV2Router02Full(routerAddress);
        IVRFCoordinatorV2 coordinator = IVRFCoordinatorV2(vrfCoordinator);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Add Liquidity (if needed)
        // Check balance first to see if we have tokens to add
        uint256 myBalance = token.balanceOf(deployer);
        if (myBalance >= 100_000 ether) {
            console.log("Adding Liquidity...");
            token.setSwapEnabled(false);
            token.approve(routerAddress, 100_000 ether);

            try router.addLiquidityETH{
                value: 0.01 ether
            }(tokenAddress, 100_000 ether, 0, 0, deployer, block.timestamp + 300) {
                console.log("Liquidity Added Successfully");
            } catch {
                console.log("Liquidity Add Failed (Maybe already exists or insufficient ETH)");
            }

            token.setSwapEnabled(true);
        } else {
            console.log("Insufficient Token Balance for Liquidity");
        }

        // 2. Authorize VRF Consumers
        console.log("Authorizing Roulette on VRF...");
        try coordinator.addConsumer(subscriptionId, rouletteAddress) {
            console.log("Roulette Authorized");
        } catch {
            console.log("Roulette Authorization Failed (Maybe already authorized or not sub owner)");
        }

        console.log("Authorizing Vault on VRF...");
        try coordinator.addConsumer(subscriptionId, vaultAddress) {
            console.log("Vault Authorized");
        } catch {
            console.log("Vault Authorization Failed");
        }

        vm.stopBroadcast();
    }
}
