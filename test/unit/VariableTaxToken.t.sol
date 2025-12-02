// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/VariableTaxToken.sol";

contract VariableTaxTokenTest is Test {
    VariableTaxToken public token;
    address public owner;
    address public teamWallet;
    address public buybackPool;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        teamWallet = makeAddr("teamWallet");
        buybackPool = makeAddr("buybackPool");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        token = new VariableTaxToken(
            "Variable Tax Token",
            "VTT",
            teamWallet,
            buybackPool,
            1_000_000 ether,
            address(0) // No router for unit tests
        );

        token.transfer(user1, 10_000 ether);
    }

    function testInitialState() public {
        assertEq(token.name(), "Variable Tax Token");
        assertEq(token.symbol(), "VTT");
        assertEq(token.totalSupply(), 1_000_000 ether);
        assertEq(token.balanceOf(user1), 10_000 ether);
    }

    function testTaxCalculationTier1() public {
        // Tier 1: 0 - 999 ether, 2% tax
        uint256 amount = 100 ether;
        uint256 tax = token.calculateTax(amount);
        assertEq(tax, 2 ether); // 2% of 100
    }

    function testTaxCalculationTier2() public {
        // Tier 2: 1000 - 10000 ether, 5% tax
        // We need to increase volume first
        vm.prank(user1);
        token.transfer(user2, 1000 ether); // This adds 1000 to volume

        uint256 amount = 100 ether;
        uint256 tax = token.calculateTax(amount);
        // Current volume is 1000, so it falls into Tier 2 (>= 1000)
        assertEq(tax, 5 ether); // 5% of 100
    }

    function testTransferWithTax() public {
        uint256 amount = 100 ether;
        uint256 expectedTax = 2 ether; // 2% initially
        uint256 expectedTeam = expectedTax / 2;
        uint256 expectedBuyback = expectedTax / 2;

        vm.prank(user1);
        token.transfer(user2, amount);

        assertEq(token.balanceOf(user2), amount - expectedTax);
        assertEq(token.balanceOf(teamWallet), expectedTeam);
        assertEq(token.balanceOf(buybackPool), expectedBuyback);
    }

    function testVolumeReset() public {
        vm.prank(user1);
        token.transfer(user2, 100 ether);
        assertEq(token.totalVolume(), 100 ether);

        // Warp time forward by 1 day + 1 second
        vm.warp(block.timestamp + 1 days + 1);

        vm.prank(user1);
        token.transfer(user2, 100 ether);

        // Volume should be reset to just the new transfer amount
        assertEq(token.totalVolume(), 100 ether);
    }

    function testSetTaxTiers() public {
        VariableTaxToken.TaxTier[] memory newTiers = new VariableTaxToken.TaxTier[](1);
        newTiers[0] = VariableTaxToken.TaxTier(0, type(uint256).max, 500); // Flat 5%

        token.setTaxTiers(newTiers);

        uint256 tax = token.calculateTax(100 ether);
        assertEq(tax, 5 ether);
    }
}
