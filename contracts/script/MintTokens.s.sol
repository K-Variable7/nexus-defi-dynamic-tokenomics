// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VariableTaxToken.sol";

contract MintTokens is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address tokenAddress = 0x7784fF80C9D58686956428352734A8a28637B84C;
        VariableTaxToken token = VariableTaxToken(payable(tokenAddress));

        vm.startBroadcast(deployerPrivateKey);

        // Mint 1,000,000 Tokens to deployer
        // Note: VariableTaxToken doesn't have a public mint function,
        // but the owner might have minted initial supply to themselves.
        // If the balance is 0, it means we transferred it all to LP or elsewhere.

        // Let's check if we can mint or if we need to buy.
        // Since we are owner, we might not have a mint function exposed.
        // Let's check the contract code again.

        // Actually, VariableTaxToken inherits ERC20Burnable but not Mintable.
        // The constructor mints initial supply.
        // If we have 0 balance, we must have spent it all adding liquidity.

        // We can swap ETH for Tokens to get some back.

        vm.stopBroadcast();
    }
}
