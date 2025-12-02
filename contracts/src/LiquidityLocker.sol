// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LiquidityLocker
 * @notice Users lock LP tokens (or any ERC20) for a fixed duration to earn ETH dividends.
 * @dev Longer locks grant higher "weight" in the dividend pool.
 *      Early withdrawal incurs a penalty proportional to the remaining time.
 */
contract LiquidityLocker is ReentrancyGuard, Ownable {
    IERC20 public stakingToken; // The LP Token or Asset to lock

    struct LockInfo {
        uint256 amount; // Amount staked
        uint256 weightedAmount; // Amount * Multiplier
        uint256 lockDate; // When the lock started
        uint256 unlockDate; // When the lock ends
        uint256 multiplier; // The multiplier applied (basis points, e.g. 100 = 1x)
        uint256 rewardDebt; // For tracking ETH rewards
    }

    // Mapping: User -> Array of Locks (User can have multiple separate locks)
    mapping(address => LockInfo[]) public userLocks;

    uint256 public totalWeightedStake;
    uint256 public accEthPerShare; // Accumulated ETH per weighted share

    // Constants
    uint256 constant PRECISION = 1e12;

    // Lock Durations (in seconds)
    uint256 constant ONE_MONTH = 30 days;
    uint256 constant THREE_MONTHS = 90 days;
    uint256 constant SIX_MONTHS = 180 days;
    uint256 constant ONE_YEAR = 365 days;

    // Multipliers (in basis points, 100 = 1x)
    uint256 constant MULT_NO_LOCK = 100; // 1x
    uint256 constant MULT_1_MONTH = 125; // 1.25x
    uint256 constant MULT_3_MONTHS = 150; // 1.5x
    uint256 constant MULT_6_MONTHS = 200; // 2x
    uint256 constant MULT_1_YEAR = 400; // 4x

    event Deposited(address indexed user, uint256 amount, uint256 lockIndex, uint256 unlockDate);
    event Withdrawn(address indexed user, uint256 amount, uint256 penalty, uint256 reward);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardsReceived(uint256 amount);

    constructor(address _stakingToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
    }

    // 1. Receive ETH Rewards (from Arcade/Taxes)
    receive() external payable {
        if (totalWeightedStake > 0) {
            accEthPerShare += (msg.value * PRECISION) / totalWeightedStake;
            emit RewardsReceived(msg.value);
        }
    }

    // 2. Deposit / Lock
    // durationType: 0 = No Lock, 1 = 1m, 2 = 3m, 3 = 6m, 4 = 1y
    function deposit(uint256 _amount, uint8 _durationType) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");

        uint256 multiplier = MULT_NO_LOCK;
        uint256 duration = 0;

        if (_durationType == 1) {
            multiplier = MULT_1_MONTH;
            duration = ONE_MONTH;
        } else if (_durationType == 2) {
            multiplier = MULT_3_MONTHS;
            duration = THREE_MONTHS;
        } else if (_durationType == 3) {
            multiplier = MULT_6_MONTHS;
            duration = SIX_MONTHS;
        } else if (_durationType == 4) {
            multiplier = MULT_1_YEAR;
            duration = ONE_YEAR;
        }

        stakingToken.transferFrom(msg.sender, address(this), _amount);

        uint256 weightedAmount = (_amount * multiplier) / 100;

        LockInfo memory newLock = LockInfo({
            amount: _amount,
            weightedAmount: weightedAmount,
            lockDate: block.timestamp,
            unlockDate: block.timestamp + duration,
            multiplier: multiplier,
            rewardDebt: (weightedAmount * accEthPerShare) / PRECISION
        });

        userLocks[msg.sender].push(newLock);
        totalWeightedStake += weightedAmount;

        emit Deposited(msg.sender, _amount, userLocks[msg.sender].length - 1, newLock.unlockDate);
    }

    // 3. Claim Rewards (for a specific lock)
    function claim(uint256 _lockIndex) external nonReentrant {
        _claim(msg.sender, _lockIndex);
    }

    function _claim(address _user, uint256 _lockIndex) internal {
        require(_lockIndex < userLocks[_user].length, "Invalid lock index");
        LockInfo storage lock = userLocks[_user][_lockIndex];

        uint256 pending = (lock.weightedAmount * accEthPerShare) / PRECISION - lock.rewardDebt;

        if (pending > 0) {
            lock.rewardDebt = (lock.weightedAmount * accEthPerShare) / PRECISION; // Reset debt
            (bool success,) = payable(_user).call{value: pending}("");
            require(success, "ETH transfer failed");
            emit RewardClaimed(_user, pending);
        }
    }

    // 4. Withdraw (Early or Mature)
    function withdraw(uint256 _lockIndex) external nonReentrant {
        require(_lockIndex < userLocks[msg.sender].length, "Invalid lock index");
        LockInfo storage lock = userLocks[msg.sender][_lockIndex];
        require(lock.amount > 0, "Already withdrawn");

        // First, claim any pending rewards
        _claim(msg.sender, _lockIndex);

        uint256 amountToSend = lock.amount;
        uint256 penalty = 0;

        // Check for Early Withdrawal Penalty
        if (block.timestamp < lock.unlockDate) {
            // Penalty Logic: Linear Proration
            // If you lock for 100 days and withdraw after 20 days:
            // Remaining = 80 days. Penalty = 80% of principal.

            uint256 totalDuration = lock.unlockDate - lock.lockDate;
            uint256 timeRemaining = lock.unlockDate - block.timestamp;

            // Penalty = (Amount * TimeRemaining) / TotalDuration
            penalty = (lock.amount * timeRemaining) / totalDuration;
            amountToSend = lock.amount - penalty;
        }

        // Update Global State
        totalWeightedStake -= lock.weightedAmount;

        // Clear Lock
        lock.amount = 0;
        lock.weightedAmount = 0;
        lock.rewardDebt = 0;

        // Transfer User Share
        if (amountToSend > 0) {
            stakingToken.transfer(msg.sender, amountToSend);
        }

        emit Withdrawn(msg.sender, amountToSend, penalty, 0);
    }

    // View Functions
    function getPendingReward(address _user, uint256 _lockIndex) external view returns (uint256) {
        if (_lockIndex >= userLocks[_user].length) return 0;
        LockInfo memory lock = userLocks[_user][_lockIndex];
        return (lock.weightedAmount * accEthPerShare) / PRECISION - lock.rewardDebt;
    }

    function getUserLocks(address _user) external view returns (LockInfo[] memory) {
        return userLocks[_user];
    }
}
