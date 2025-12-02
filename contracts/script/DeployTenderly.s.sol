// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VariableTaxToken.sol";
import "../src/Lottery.sol";
import "../src/StakingPool.sol";
import "../src/NexusNFT.sol";
import "../src/PredictionMarket.sol";
import "../src/Roulette.sol";
import "../src/CommunityDAO.sol";
import "../src/Suggestions.sol";
import "../src/MultiplierVault.sol";
import "../src/utils/MockWETH.sol";
import "../src/utils/MockRouter.sol";

contract DeployTenderly is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Mocks
        MockWETH weth = new MockWETH();
        MockRouter router = new MockRouter(address(weth));

        // 2. Deploy Core Ecosystem
        NexusNFT nft = new NexusNFT();

        // 3. Deploy Token (with Router, initially no StakingPool)
        VariableTaxToken token = new VariableTaxToken(
            "Nexus Token",
            "NEX",
            deployer, // Team Wallet
            address(0), // Buyback/Staking Pool (Set later)
            1_000_000_000 * 10 ** 18,
            address(router)
        );

        // 4. Deploy StakingPool & Link
        StakingPool stakingPool = new StakingPool(address(token), address(nft));
        token.setBuybackPool(address(stakingPool));

        // 5. Deploy DAO & Suggestions
        CommunityDAO dao = new CommunityDAO(address(stakingPool));
        Suggestions suggestions = new Suggestions();

        // 6. Deploy Games
        // MultiplierVault: VRF Mock (using deployer as coordinator for local), StakingPool, TeamWallet
        MultiplierVault vault = new MultiplierVault(
            deployer, // Mock VRF Coordinator
            1, // Sub ID
            bytes32(0), // Key Hash
            address(stakingPool),
            deployer // Team Wallet
        );

        Roulette roulette = new Roulette(
            deployer, // VRF Coordinator
            1, // Sub ID
            bytes32(0), // Key Hash
            deployer // Initial Owner
        );

        // 7. Setup Liquidity for Swap
        router.setToken(address(token));

        // Approve Router to spend tokens
        token.approve(address(router), type(uint256).max);

        // Add Liquidity (10 ETH + 1M Tokens)
        // Send ETH to Router
        (bool success,) = address(router).call{value: 10 ether}("");
        require(success, "ETH transfer failed");

        // Send Tokens to Router
        token.transfer(address(router), 1_000_000 * 10 ** 18);

        vm.stopBroadcast();

        console.log("--- Deployed Addresses ---");
        console.log("WETH:", address(weth));
        console.log("Router:", address(router));
        console.log("Token:", address(token));
        console.log("Staking:", address(stakingPool));
        console.log("NFT:", address(nft));
        console.log("DAO:", address(dao));
        console.log("Suggestions:", address(suggestions));
        console.log("Vault:", address(vault));
        console.log("Roulette:", address(roulette));
    }
}
