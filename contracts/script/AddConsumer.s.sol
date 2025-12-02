// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";

interface IVRFCoordinatorV2 {
    function addConsumer(uint64 subId, address consumer) external;
}

contract AddConsumer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Sepolia Config
        address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
        uint64 subscriptionId = uint64(vm.envOr("VRF_SUBSCRIPTION_ID", uint256(12498)));

        // New Roulette Address
        address rouletteAddress = 0xd05b7919189DfB09904E6183ff062942eDE565B0;

        vm.startBroadcast(deployerPrivateKey);

        console.log("Adding Roulette Consumer:", rouletteAddress);
        console.log("Subscription ID:", subscriptionId);

        IVRFCoordinatorV2(vrfCoordinator).addConsumer(subscriptionId, rouletteAddress);

        console.log("Consumer Added Successfully");

        vm.stopBroadcast();
    }
}
