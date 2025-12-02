// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/PlatformFactory.sol";
import "../src/utils/MockRouter.sol";
import "../src/utils/MockWETH.sol";
import "../src/VariableTaxToken.sol";
import "../src/MultiplierVault.sol";
import "../src/Lottery.sol";
import "../src/Roulette.sol";
import "../src/utils/MockLP.sol";
import "../src/LiquidityLocker.sol";
import "../src/PredictionMarket.sol";
import "../src/utils/MockOracle.sol";
import "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2Mock.sol";

contract DeployLocal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 0. Deploy VRF Mock
        VRFCoordinatorV2Mock vrfMock = new VRFCoordinatorV2Mock(0.1 ether, 1e9);
        console.log("VRF Mock Deployed at:", address(vrfMock));
        uint64 subId = vrfMock.createSubscription();
        vrfMock.fundSubscription(subId, 100 ether);

        // 1. Deploy Mock WETH
        MockWETH weth = new MockWETH();
        console.log("MockWETH Deployed at:", address(weth));

        // 2. Deploy Mock Router
        MockRouter router = new MockRouter(address(weth));
        console.log("MockRouter Deployed at:", address(router));

        // 3. Deploy Factory
        PlatformFactory factory = new PlatformFactory();
        console.log("Factory Deployed at:", address(factory));

        // 4. Create Platform
        (address tokenAddr, address poolAddr, address stakedTokenAddr, address nftAddr) =
            factory.createPlatform("Nexus Token", "NEX", 1_000_000 ether, deployer, address(router));

        console.log("Token Deployed at:", tokenAddr);
        console.log("Pool Deployed at:", poolAddr);
        console.log("StakedToken Deployed at:", stakedTokenAddr);
        console.log("NFT Deployed at:", nftAddr);

        // 5. Deploy MultiplierVault (Team Battle)
        // VRF Coordinator (Mock), SubId, KeyHash, Staking Pool, Team Wallet
        MultiplierVault vault = new MultiplierVault(
            address(vrfMock),
            subId,
            0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c,
            poolAddr,
            deployer
        );
        console.log("MultiplierVault Deployed at:", address(vault));
        vrfMock.addConsumer(subId, address(vault));

        // 6. Deploy Lottery
        Lottery lottery = new Lottery(tokenAddr);
        console.log("Lottery Deployed at:", address(lottery));

        // 7. Deploy Roulette
        Roulette roulette = new Roulette(
            address(vrfMock), subId, 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c, deployer
        );
        console.log("Roulette Deployed at:", address(roulette));
        vrfMock.addConsumer(subId, address(roulette));

        // 8. Configure Router
        router.setToken(tokenAddr);

        // 7. Add Liquidity to Router
        // Send 10 ETH to Router
        (bool success,) = address(router).call{value: 10 ether}("");
        require(success, "ETH transfer failed");

        // Send 100,000 Tokens to Router
        VariableTaxToken token = VariableTaxToken(payable(tokenAddr));
        token.transfer(address(router), 100_000 ether);

        console.log("Liquidity Added to MockRouter (10 ETH, 100,000 NEX)");

        // 10. Deploy Mock LP and Liquidity Locker
        MockLP lpToken = new MockLP();
        console.log("MockLP Deployed at:", address(lpToken));

        LiquidityLocker locker = new LiquidityLocker(address(lpToken));
        console.log("LiquidityLocker Deployed at:", address(locker));

        // 11. Deploy Mock Oracles
        MockOracle ethOracle = new MockOracle(3000 * 1e8, 8); // Chainlink uses 8 decimals
        console.log("ETH Oracle Deployed at:", address(ethOracle));

        MockOracle btcOracle = new MockOracle(60000 * 1e8, 8);
        console.log("BTC Oracle Deployed at:", address(btcOracle));

        // 12. Deploy Prediction Market
        PredictionMarket prediction = new PredictionMarket();
        console.log("PredictionMarket Deployed at:", address(prediction));

        // 13. Add Markets
        prediction.addMarket("ETH", address(ethOracle), 300); // 5 min rounds
        prediction.addPairMarket("ETH-BTC", address(ethOracle), address(btcOracle), 300);

        console.log("Markets Added: ETH, ETH-BTC");

        vm.stopBroadcast();
    }
}
