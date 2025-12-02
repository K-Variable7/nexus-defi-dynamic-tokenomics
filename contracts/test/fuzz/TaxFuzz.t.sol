// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/VariableTaxToken.sol";

contract TaxFuzzTest is Test {
    VariableTaxToken public token;
    address public teamWallet;
    address public buybackPool;
    address public user1;
    address public user2;

    function setUp() public {
        teamWallet = makeAddr("teamWallet");
        buybackPool = makeAddr("buybackPool");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        token =
            new VariableTaxToken("Variable Tax Token", "VTT", teamWallet, buybackPool, 1_000_000_000 ether, address(0));

        token.transfer(user1, 100_000_000 ether);
    }

    function testFuzzCalculateTax(uint256 amount) public {
        // Bound amount to reasonable limits to avoid overflow in test logic (though contract should handle it)
        // Max supply is 1B ether.
        amount = bound(amount, 0, 1_000_000_000 ether);

        uint256 tax = token.calculateTax(amount);

        // Tax should never exceed 10% (max tier)
        assertLe(tax, (amount * 1000) / 10000);
    }

    function testFuzzTransfer(uint256 amount) public {
        amount = bound(amount, 1, 100_000 ether); // Limit transfer size

        uint256 preBalanceUser1 = token.balanceOf(user1);
        uint256 preBalanceUser2 = token.balanceOf(user2);
        uint256 preBalanceTeam = token.balanceOf(teamWallet);
        uint256 preBalancePool = token.balanceOf(buybackPool);

        vm.prank(user1);
        token.transfer(user2, amount);

        uint256 tax = token.calculateTax(amount); // Calculate expected tax based on state BEFORE transfer?
        // Wait, calculateTax uses current volume.
        // Inside transfer, volume is updated AFTER tax calculation?
        // Let's check contract:
        // uint256 tax = calculateTax(value);
        // ...
        // totalVolume += value;
        // So it uses volume BEFORE the transfer. Correct.

        // However, if we run multiple fuzz runs, volume increases.
        // But in Foundry fuzzing, each run resets state unless configured otherwise.
        // Default is reset. So volume is 0.
        // Tier 1: 0-999 ether -> 2% tax.

        if (amount <= 999 ether) {
            // 2%
            assertEq(token.balanceOf(user2), preBalanceUser2 + amount - (amount * 200 / 10000));
        } else {
            // If amount > 999, it might cross tiers?
            // calculateTax uses current volume (0).
            // So it uses the tier for 0 volume.
            // Tier 1 is 0 to 999.
            // If volume is 0, it matches Tier 1.
            // So tax is 2%.
            // Even if amount is huge, the RATE is determined by CURRENT volume.
            // The contract logic:
            // if (currentVolume >= min && currentVolume <= max) return rate
            // So if volume is 0, it returns 2%.
            assertEq(token.balanceOf(user2), preBalanceUser2 + amount - (amount * 200 / 10000));
        }
    }
}
