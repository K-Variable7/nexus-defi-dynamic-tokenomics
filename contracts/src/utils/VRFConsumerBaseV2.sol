// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @notice Interface for contracts using VRF randomness
 * @dev https://docs.chain.link/docs/vrf/v2/subscription/examples/get-a-random-number/
 * @dev The purpose of this class is to provide a default implementation of the
 * @dev fulfillRandomWords method that the VRFCoordinatorV2 will call.
 */
abstract contract VRFConsumerBaseV2 {
    error OnlyCoordinatorCanFulfill(address have, address want);
    address private immutable vrfCoordinator;

    /**
     * @param _vrfCoordinator address of VRFCoordinator contract
     */
    constructor(address _vrfCoordinator) {
        vrfCoordinator = _vrfCoordinator;
    }

    /**
     * @notice fulfillRandomWords handles the VRF response. Your contract must
     * @notice implement it. See "SECURITY CONSIDERATIONS" above for important
     * @notice principles to keep in mind when implementing your fulfillment
     * @notice method.
     *
     * @dev VRFConsumerBaseV2 expects its subcontracts to have a method with this
     * @dev signature, and will call it once it has verified the proof
     * @dev associated with the randomness. (It is triggered via a call to
     * @dev rawFulfillRandomWords below.)
     *
     * @param requestId The Id initially returned by requestRandomWords
     * @param randomWords the VRF output expanded to the requested number of words
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual;

    // rawFulfillRandomWords is called by VRFCoordinator when it receives a valid VRF
    // proof. rawFulfillRandomWords then calls fulfillRandomWords, after validating
    // the origin of the call
    function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        if (msg.sender != vrfCoordinator) {
            revert OnlyCoordinatorCanFulfill(msg.sender, vrfCoordinator);
        }
        fulfillRandomWords(requestId, randomWords);
    }
}
