// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingPool is Ownable {
    IERC20 public stakingToken;

    struct Stake {
        uint256 amount;
        uint256 weightedAmount;
        uint256 lockEndTime;
    }

    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 lockDuration);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _stakingToken, address _initialOwner) Ownable(_initialOwner) {
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 _amount, uint256 _lockDuration) external {
        require(_amount > 0, "Cannot stake 0");
        require(_lockDuration >= 1 days, "Min lock 1 day");

        stakingToken.transferFrom(msg.sender, address(this), _amount);

        uint256 multiplier = 100;
        if (_lockDuration >= 365 days) {
            multiplier = 200; // 2x voting power
        } else if (_lockDuration >= 30 days) {
            multiplier = 150; // 1.5x
        }

        uint256 weighted = (_amount * multiplier) / 100;

        stakes[msg.sender] = Stake({
            amount: stakes[msg.sender].amount + _amount,
            weightedAmount: stakes[msg.sender].weightedAmount + weighted,
            lockEndTime: block.timestamp + _lockDuration
        });

        emit Staked(msg.sender, _amount, _lockDuration);
    }

    function withdraw() external {
        Stake storage userStake = stakes[msg.sender];
        require(block.timestamp >= userStake.lockEndTime, "Stake locked");
        require(userStake.amount > 0, "No stake");

        uint256 amount = userStake.amount;
        delete stakes[msg.sender];

        stakingToken.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }
}
