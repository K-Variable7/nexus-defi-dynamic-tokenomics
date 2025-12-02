// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Roulette.sol";

contract DeployRouletteOnly is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // --- Configuration (Sepolia) ---
        address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
        bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
        uint64 subscriptionId = uint64(vm.envOr("VRF_SUBSCRIPTION_ID", uint256(0)));

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Roulette
        Roulette roulette = new Roulette(vrfCoordinator, subscriptionId, keyHash, deployer);
        console.log("Roulette Deployed at:", address(roulette));

        vm.stopBroadcast();
    }
}
