// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/VariableTaxToken.sol";
import "../../src/StakingPool.sol";
import "../../src/StakedToken.sol";

contract IntegrationFlowTest is Test {
    VariableTaxToken public taxToken;
    StakedToken public stakedToken;
    StakingPool public pool;

    address public teamWallet;
    address public trader1;
    address public trader2;
    address public staker;

    function setUp() public {
        teamWallet = makeAddr("teamWallet");
        trader1 = makeAddr("trader1");
        trader2 = makeAddr("trader2");
        staker = makeAddr("staker");

        // 1. Deploy Tax Token (Reward Token)
        taxToken = new VariableTaxToken(
            "Variable Tax Token",
            "VTT",
            teamWallet,
            address(0), // Placeholder
            1_000_000 ether,
            address(0) // No router
        );

        // 2. Deploy Staked Token
        stakedToken = new StakedToken("Staked Token", "STK");

        // 3. Deploy Staking Pool
        pool = new StakingPool(address(stakedToken), address(taxToken));

        // 4. Link Tax Token to Pool
        taxToken.setBuybackPool(address(pool));
        taxToken.setExcluded(address(pool), true);

        // 5. Distribute tokens
        taxToken.transfer(trader1, 10_000 ether);
        stakedToken.mint(staker, 1000 ether);
    }

    function testTaxToStakingFlow() public {
        // 1. Staker stakes tokens
        vm.startPrank(staker);
        stakedToken.approve(address(pool), 1000 ether);
        pool.stake(1000 ether);
        vm.stopPrank();

        // 2. Trader generates volume and tax
        // Tax is 2% for < 1000 volume.
        // Transfer 500. Tax = 10.
        // Split 50/50. 5 to team, 5 to pool.
        vm.prank(trader1);
        taxToken.transfer(trader2, 500 ether);

        // Verify Pool received tax
        assertEq(taxToken.balanceOf(address(pool)), 5 ether);

        // 3. Time passes, rewards accumulate
        vm.warp(block.timestamp + 10); // 10 seconds
        // Reward rate is 1e18/sec. 10 * 1e18 = 10 tokens.
        // Pool has 5 tokens.
        // If staker claims 10, it will fail if pool only has 5.
        // So we need to ensure tax provides enough, or we accept failure/partial?
        // ERC20 transfer will revert if insufficient balance.

        // Let's generate MORE tax to fund the pool.
        // Need 5 more.
        // Transfer another 500. Tax = 10. 5 to pool. Total 10.
        vm.prank(trader1);
        taxToken.transfer(trader2, 500 ether);

        assertEq(taxToken.balanceOf(address(pool)), 10 ether);

        // 4. Staker claims rewards
        vm.prank(staker);
        pool.claimReward();

        // Verify staker got the rewards
        assertEq(taxToken.balanceOf(staker), 10 ether);
        // Verify pool is empty
        assertEq(taxToken.balanceOf(address(pool)), 0);
    }
}
