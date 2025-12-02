// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Roulette is VRFConsumerBaseV2, Ownable {
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    struct SpinRequest {
        address player;
        uint256 betAmount;
        uint256 betNumber; // 0-36
        bool fulfilled;
        bool won;
    }

    mapping(uint256 => SpinRequest) public requests;
    event SpinRequested(uint256 indexed requestId, address indexed player, uint256 betAmount, uint256 betNumber);
    event SpinResult(uint256 indexed requestId, address indexed player, uint256 resultNumber, bool won, uint256 payout);

    constructor(address _vrfCoordinator, uint64 _subscriptionId, bytes32 _keyHash, address _initialOwner)
        VRFConsumerBaseV2(_vrfCoordinator)
        Ownable(_initialOwner)
    {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    function spin(uint256 _betNumber) external payable {
        require(_betNumber <= 38, "Invalid bet type"); // 0-36: Number, 37: Red, 38: Black
        require(msg.value > 0, "Bet amount must be > 0");

        uint256 requestId =
            COORDINATOR.requestRandomWords(keyHash, subscriptionId, requestConfirmations, callbackGasLimit, numWords);

        requests[requestId] = SpinRequest({
            player: msg.sender, betAmount: msg.value, betNumber: _betNumber, fulfilled: false, won: false
        });

        emit SpinRequested(requestId, msg.sender, msg.value, _betNumber);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        SpinRequest storage request = requests[requestId];
        require(!request.fulfilled, "Already fulfilled");

        uint256 resultNumber = randomWords[0] % 37;
        bool won = false;
        uint256 payout = 0;

        if (request.betNumber <= 36) {
            won = (resultNumber == request.betNumber);
            if (won) {
                payout = request.betAmount * 36; // Standard 35:1 payout (return stake + 35x)
            }
        } else if (request.betNumber == 37) { // Red
            if (isRed(resultNumber)) {
                won = true;
                payout = request.betAmount * 2; // 1:1 payout
            }
        } else if (request.betNumber == 38) { // Black
            if (!isRed(resultNumber) && resultNumber != 0) {
                won = true;
                payout = request.betAmount * 2; // 1:1 payout
            }
        }

        if (won) {
            (bool success,) = payable(request.player).call{value: payout}("");
            require(success, "Transfer failed");
        }

        request.fulfilled = true;
        request.won = won;

        emit SpinResult(requestId, request.player, resultNumber, won, payout);
    }

    function isRed(uint256 number) public pure returns (bool) {
        // Red numbers: 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
        if (number == 1 || number == 3 || number == 5 || number == 7 || number == 9 || number == 12 ||
            number == 14 || number == 16 || number == 18 || number == 19 || number == 21 || number == 23 ||
            number == 25 || number == 27 || number == 30 || number == 32 || number == 34 || number == 36) {
            return true;
        }
        return false;
    }

    // Allow contract to receive funds for payouts
    receive() external payable {}
}
