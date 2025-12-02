// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VariableTaxToken.sol";

contract CheckOwner is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address tokenAddress = 0x3C65386c6BdFe36bDda0C8609D163af1846d0E83;
        VariableTaxToken token = VariableTaxToken(payable(tokenAddress));

        console.log("Token Owner:     ", token.owner());
        console.log("Private Key Addr:", deployer);

        if (token.owner() == deployer) {
            console.log("MATCH! You are the owner.");
        } else {
            console.log("MISMATCH! You are NOT the owner.");
        }
    }
}
