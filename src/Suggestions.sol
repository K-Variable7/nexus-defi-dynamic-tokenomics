// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Suggestions {
    struct Suggestion {
        uint256 id;
        address user;
        string message;
        uint256 timestamp;
    }

    Suggestion[] public suggestions;

    event SuggestionCreated(uint256 indexed id, address indexed user, string message, uint256 timestamp);

    function postSuggestion(string calldata _message) external {
        require(bytes(_message).length > 0, "Message cannot be empty");
        require(bytes(_message).length <= 280, "Message too long"); // Twitter style limit

        uint256 id = suggestions.length;
        suggestions.push(Suggestion(id, msg.sender, _message, block.timestamp));

        emit SuggestionCreated(id, msg.sender, _message, block.timestamp);
    }

    function getSuggestions() external view returns (Suggestion[] memory) {
        return suggestions;
    }

    function getSuggestionsCount() external view returns (uint256) {
        return suggestions.length;
    }
}
