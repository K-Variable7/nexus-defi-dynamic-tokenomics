// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Suggestions.sol";

contract DeploySuggestions is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        Suggestions suggestions = new Suggestions();

        console.log("--- Suggestions Deployed ---");
        console.log("Address:", address(suggestions));

        vm.stopBroadcast();
    }
}
