// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/Roulette.sol";
import "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2Mock.sol";

contract RouletteFuzzTest is Test {
    Roulette roulette;
    VRFCoordinatorV2Mock vrfMock;
    uint64 subId;
    address player = address(0x123);

    function setUp() public {
        vrfMock = new VRFCoordinatorV2Mock(0.1 ether, 1e9);
        subId = vrfMock.createSubscription();
        vrfMock.fundSubscription(subId, 100 ether);

        roulette = new Roulette(address(vrfMock), subId, bytes32(0), address(this));
        vrfMock.addConsumer(subId, address(roulette));

        // Fund roulette for payouts
        vm.deal(address(roulette), 100 ether);
        vm.deal(player, 100 ether);
    }

    // Fuzz test: Ensure payout is correct for any bet amount and any random result
    function testFuzz_SpinPayouts(uint256 betAmount, uint256 betNumber, uint256 randomSeed) public {
        // Constrain inputs to reasonable values
        betAmount = bound(betAmount, 0.001 ether, 1 ether);
        
        // Valid bet types: 0-36 (Numbers), 37 (Red), 38 (Black)
        betNumber = bound(betNumber, 0, 38);

        vm.prank(player);
        roulette.spin{value: betAmount}(betNumber);

        // Get request ID (it's 1 because it's the first request)
        uint256 requestId = 1;

        // Mock VRF fulfillment
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = randomSeed;
        
        uint256 balanceBefore = player.balance;
        
        vm.recordLogs();
        vrfMock.fulfillRandomWords(requestId, address(roulette));
        Vm.Log[] memory entries = vm.getRecordedLogs();

        uint256 resultNumber;
        bool wonEvent;
        uint256 payoutEvent;
        bool eventFound = false;

        // SpinResult signature: 0x...
        // We can just look for the event from the roulette address
        for (uint i = 0; i < entries.length; i++) {
            if (entries[i].emitter == address(roulette)) {
                // Check topic 0 (event signature) if needed, or just assume it's the only event emitted during fulfill
                // SpinResult is the only event in fulfillRandomWords
                // topics[0] = keccak256("SpinResult(uint256,address,uint256,bool,uint256)")
                // requestId is indexed (topic 1)
                // player is indexed (topic 2)
                // resultNumber, won, payout are data
                
                if (entries[i].topics.length == 3) {
                    (resultNumber, wonEvent, payoutEvent) = abi.decode(entries[i].data, (uint256, bool, uint256));
                    eventFound = true;
                    break;
                }
            }
        }
        
        require(eventFound, "SpinResult event not found");

        bool shouldWin = false;
        uint256 expectedPayout = 0;

        if (betNumber <= 36) {
            if (resultNumber == betNumber) {
                shouldWin = true;
                expectedPayout = betAmount * 36; // 35:1 (Stake + 35x)
            }
        } else if (betNumber == 37) { // Red
            if (roulette.isRed(resultNumber)) {
                shouldWin = true;
                expectedPayout = betAmount * 2; // 1:1
            }
        } else if (betNumber == 38) { // Black
            // Black is not red and not 0
            if (!roulette.isRed(resultNumber) && resultNumber != 0) {
                shouldWin = true;
                expectedPayout = betAmount * 2; // 1:1
            }
        }

        assertEq(wonEvent, shouldWin, "Win status mismatch");
        assertEq(payoutEvent, expectedPayout, "Payout event mismatch");

        if (shouldWin) {
            assertEq(player.balance, balanceBefore + expectedPayout, "Balance payout mismatch");
        } else {
            assertEq(player.balance, balanceBefore, "Should not receive payout on loss");
        }
    }
}
