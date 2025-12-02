// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MultiplierVault.sol";
import "../src/Roulette.sol";

contract FixArcade is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Sepolia Config
        address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
        bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;

        // Use the ID from .env.example or environment
        uint64 subscriptionId = uint64(vm.envOr("VRF_SUBSCRIPTION_ID", uint256(12498)));

        // Existing Addresses (from constants.ts or previous deployment)
        address poolAddr = 0x17bD6cCB9d98974eDE38311fC2930e88cC84C005; // Staking Pool

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MultiplierVault
        MultiplierVault vault = new MultiplierVault(vrfCoordinator, subscriptionId, keyHash, poolAddr, deployer);
        console.log("MultiplierVault Deployed at:", address(vault));

        // 2. Deploy Roulette
        Roulette roulette = new Roulette(vrfCoordinator, subscriptionId, keyHash, deployer);
        console.log("Roulette Deployed at:", address(roulette));

        vm.stopBroadcast();
    }
}
