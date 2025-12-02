// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/PlatformFactory.sol";
import "../src/Lottery.sol";
import "../src/PredictionMarket.sol";
import "../src/Roulette.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Uniswap V2 Router on Sepolia (Standard address)
        address router = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
        // Chainlink ETH/USD Price Feed on Sepolia
        address priceFeed = 0x694AA1769357215DE4FAC081bf1f309aDC325306;

        // Chainlink VRF Sepolia
        address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
        bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
        uint64 subscriptionId = uint64(vm.envOr("VRF_SUBSCRIPTION_ID", uint256(0)));

        vm.startBroadcast(deployerPrivateKey);

        // Deploy new Factory
        PlatformFactory factory = new PlatformFactory();
        console.log("New Factory Deployed at:", address(factory));

        (address token, address pool, address stakedToken, address nft) = factory.createPlatform(
            "Nexus Token", // Name
            "NEX", // Symbol
            1_000_000 ether, // Initial Supply
            deployer, // Team Wallet (You)
            router // Router for auto-swaps
        );

        // Deploy Lottery
        Lottery lottery = new Lottery(token);
        lottery.transferOwnership(deployer);

        // Deploy Prediction Market
        PredictionMarket prediction = new PredictionMarket();
        prediction.addMarket("ETH", priceFeed, 300);
        prediction.transferOwnership(deployer);

        // Deploy Roulette
        Roulette roulette = new Roulette(
            vrfCoordinator,
            subscriptionId,
            keyHash,
            deployer // Treasury
        );
        roulette.transferOwnership(deployer);

        console.log("--- Platform Created ---");
        console.log("Token Address:      ", token);
        console.log("Staked Token:       ", stakedToken);
        console.log("Staking Pool:       ", pool);
        console.log("NFT Address:        ", nft);
        console.log("Lottery Address:    ", address(lottery));
        console.log("Prediction Address: ", address(prediction));
        console.log("Roulette Address:   ", address(roulette));

        vm.stopBroadcast();
    }
}
