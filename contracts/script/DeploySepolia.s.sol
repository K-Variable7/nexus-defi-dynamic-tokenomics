// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/PlatformFactory.sol";
import "../src/VariableTaxToken.sol";
import "../src/MultiplierVault.sol";
import "../src/Lottery.sol";
import "../src/Roulette.sol";
import "../src/LiquidityLocker.sol";
import "../src/PredictionMarket.sol";
import "../src/utils/MockLP.sol"; // We might need a mock LP if we don't have a real pair

contract DeploySepolia is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // --- Configuration (Sepolia) ---
        address router = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008; // Uniswap V2 Router (Sepolia Fork)
        address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
        bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
        uint64 subscriptionId = uint64(vm.envOr("VRF_SUBSCRIPTION_ID", uint256(0)));

        address ethFeed = 0x694AA1769357215DE4FAC081bf1f309aDC325306;
        address btcFeed = 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43;

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Factory
        PlatformFactory factory = new PlatformFactory();
        console.log("Factory Deployed at:", address(factory));

        // 2. Create Platform (Token, Pool, Staking)
        (address tokenAddr, address poolAddr, address stakedTokenAddr, address nftAddr) =
            factory.createPlatform("Nexus Token", "NEX", 1_000_000 ether, deployer, router);

        console.log("Token Deployed at:", tokenAddr);
        console.log("Pool Deployed at:", poolAddr);
        console.log("StakedToken Deployed at:", stakedTokenAddr);
        console.log("NFT Deployed at:", nftAddr);

        // 3. Deploy MultiplierVault (Team Battle)
        MultiplierVault vault = new MultiplierVault(vrfCoordinator, subscriptionId, keyHash, poolAddr, deployer);
        console.log("MultiplierVault Deployed at:", address(vault));

        // 4. Deploy Lottery
        Lottery lottery = new Lottery(tokenAddr);
        console.log("Lottery Deployed at:", address(lottery));

        // 5. Deploy Roulette
        Roulette roulette = new Roulette(vrfCoordinator, subscriptionId, keyHash, deployer);
        console.log("Roulette Deployed at:", address(roulette));

        // 6. Deploy Liquidity Locker
        // Note: On mainnet, you'd pass the actual LP token address here.
        // For now, we'll deploy a MockLP to represent the Uniswap Pair for testing the locker UI.
        MockLP lpToken = new MockLP();
        LiquidityLocker locker = new LiquidityLocker(address(lpToken));
        console.log("LiquidityLocker Deployed at:", address(locker));

        // 7. Deploy Prediction Market
        PredictionMarket prediction = new PredictionMarket();
        console.log("PredictionMarket Deployed at:", address(prediction));

        // 8. Add Markets
        prediction.addMarket("ETH", ethFeed, 300); // 5 min rounds
        prediction.addPairMarket("ETH-BTC", ethFeed, btcFeed, 300);
        console.log("Markets Added: ETH, ETH-BTC");

        vm.stopBroadcast();
    }
}
