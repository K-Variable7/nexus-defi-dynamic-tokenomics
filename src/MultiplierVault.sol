// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiplierVault is VRFConsumerBaseV2, Ownable {
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 500000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    struct VaultRound {
        uint256 id;
        uint256 endTime;
        uint256 totalPool;
        bool isClosed;
        bool isResolved;
        uint256 randomWord;
        uint8 winningTeam; // 0=Red, 1=Blue, 2=Green
        uint256 bonusAmount;
    }

    struct Deposit {
        address user;
        uint256 amount;
        uint8 team;
    }

    uint256 public currentRoundId;
    uint256 public constant ROUND_DURATION = 2 minutes;
    uint256 public constant BONUS_PERCENTAGE = 25; // 25% goes to winning team
    address public stakingPool;
    address public teamWallet;

    mapping(uint256 => VaultRound) public rounds;
    mapping(uint256 => mapping(uint8 => uint256)) public roundTeamPools; // Track total deposits per team
    mapping(uint256 => mapping(address => uint256)) public userDeposits;
    mapping(uint256 => mapping(address => uint8)) public userTeams;

    event DepositPlaced(uint256 indexed roundId, address indexed user, uint256 amount, uint8 team);
    event RoundClosed(uint256 indexed roundId, uint256 requestId);
    event RoundResolved(uint256 indexed roundId, uint8 winningTeam, uint256 bonusAmount);
    event Claimed(uint256 indexed roundId, address indexed user, uint256 amount);

    constructor(
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        address _stakingPool,
        address _teamWallet
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(msg.sender) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        stakingPool = _stakingPool;
        teamWallet = _teamWallet;
        startNewRound();
    }

    function startNewRound() internal {
        currentRoundId++;
        rounds[currentRoundId] = VaultRound({
            id: currentRoundId,
            endTime: block.timestamp + ROUND_DURATION,
            totalPool: 0,
            isClosed: false,
            isResolved: false,
            randomWord: 0,
            winningTeam: 0,
            bonusAmount: 0
        });
    }

    function deposit(uint8 _team, address _referrer) external payable {
        require(_team < 3, "Invalid team");
        VaultRound storage round = rounds[currentRoundId];
        require(!round.isClosed, "Round closed");
        require(block.timestamp < round.endTime, "Time up");
        require(msg.value > 0, "No value");

        // Referral Logic (2%)
        uint256 netAmount = msg.value;
        if (_referrer != address(0) && _referrer != msg.sender) {
            uint256 referralReward = (msg.value * 2) / 100;
            (bool success,) = _referrer.call{value: referralReward}("");
            if (success) {
                netAmount -= referralReward;
            }
        }

        // If user already deposited, they must stick to the same team for this round
        if (userDeposits[currentRoundId][msg.sender] > 0) {
            require(userTeams[currentRoundId][msg.sender] == _team, "Must stick to team");
        } else {
            userTeams[currentRoundId][msg.sender] = _team;
        }

        round.totalPool += netAmount;
        roundTeamPools[currentRoundId][_team] += netAmount;
        userDeposits[currentRoundId][msg.sender] += netAmount;

        emit DepositPlaced(currentRoundId, msg.sender, netAmount, _team);
    }

    function closeRound() external {
        VaultRound storage round = rounds[currentRoundId];
        require(!round.isClosed, "Already closed");
        require(block.timestamp >= round.endTime, "Too early");

        round.isClosed = true;
        uint256 roundIdToClose = currentRoundId;

        if (round.totalPool == 0) {
            startNewRound();
            return;
        }

        uint256 requestId =
            COORDINATOR.requestRandomWords(keyHash, subscriptionId, requestConfirmations, callbackGasLimit, numWords);

        emit RoundClosed(roundIdToClose, requestId);
    }

    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        VaultRound storage round = rounds[currentRoundId];
        round.randomWord = randomWords[0];

        // Select winning team (0, 1, or 2)
        uint8 winningTeam = uint8(randomWords[0] % 3);

        round.winningTeam = winningTeam;

        // 5% Fee (4% Staking, 1% Team)
        uint256 totalFee = (round.totalPool * 5) / 100;
        uint256 teamFee = (round.totalPool * 1) / 100;
        uint256 stakingFee = totalFee - teamFee;

        uint256 prizePool = round.totalPool - totalFee;

        if (teamFee > 0 && teamWallet != address(0)) {
            (bool success,) = teamWallet.call{value: teamFee}("");
            if (!success) {
                prizePool += teamFee; // If fail, return to pool
            }
        }

        if (stakingFee > 0 && stakingPool != address(0)) {
            (bool success,) = stakingPool.call{value: stakingFee}("");
            if (!success) {
                prizePool += stakingFee; // If fail, return to pool
            }
        }

        // Winner Takes All (minus fee)
        round.bonusAmount = prizePool;
        round.isResolved = true;

        emit RoundResolved(currentRoundId, winningTeam, round.bonusAmount);

        startNewRound();
    }

    function claim(uint256 _roundId) external {
        VaultRound storage round = rounds[_roundId];
        require(round.isResolved, "Not resolved");

        uint256 userDeposit = userDeposits[_roundId][msg.sender];
        require(userDeposit > 0, "Nothing to claim");

        uint8 userTeam = userTeams[_roundId][msg.sender];
        require(userTeam == round.winningTeam, "Only winners can claim");

        uint256 teamTotal = roundTeamPools[_roundId][userTeam];

        // Winner Takes All: Share = (UserDeposit / TeamTotal) * RoundBonusAmount
        uint256 share = (userDeposit * round.bonusAmount) / teamTotal;

        userDeposits[_roundId][msg.sender] = 0; // Prevent re-claim

        (bool success,) = payable(msg.sender).call{value: share}("");
        require(success, "Transfer failed");

        emit Claimed(_roundId, msg.sender, share);
    }

    function getRound(uint256 _roundId) external view returns (VaultRound memory) {
        return rounds[_roundId];
    }

    function getTeamPools(uint256 _roundId) external view returns (uint256[] memory) {
        uint256[] memory pools = new uint256[](3);
        pools[0] = roundTeamPools[_roundId][0];
        pools[1] = roundTeamPools[_roundId][1];
        pools[2] = roundTeamPools[_roundId][2];
        return pools;
    }
}
