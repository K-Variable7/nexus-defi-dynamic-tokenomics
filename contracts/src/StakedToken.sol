// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StakedToken
 * @author Nexus DeFi Team -- (variable.k)
 * @notice Receipt token representing a user's stake in the ecosystem.
 * @dev Mintable only by the owner (intended to be the StakingPool or Factory).
 */
contract StakedToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
