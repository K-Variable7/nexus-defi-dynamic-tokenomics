// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MockOracle is AggregatorV3Interface {
    int256 public price;
    uint8 public decimalsVal;

    constructor(int256 _initialPrice, uint8 _decimals) {
        price = _initialPrice;
        decimalsVal = _decimals;
    }

    function decimals() external view override returns (uint8) {
        return decimalsVal;
    }

    function description() external pure override returns (string memory) {
        return "Mock Oracle";
    }

    function version() external pure override returns (uint256) {
        return 1;
    }

    function getRoundData(uint80 _roundId)
        external
        view
        override
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (_roundId, price, block.timestamp, block.timestamp, _roundId);
    }

    function latestRoundData()
        external
        view
        override
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (1, price, block.timestamp, block.timestamp, 1);
    }

    function updatePrice(int256 _newPrice) external {
        price = _newPrice;
    }
}
