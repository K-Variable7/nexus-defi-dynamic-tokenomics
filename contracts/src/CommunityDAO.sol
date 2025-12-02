// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./StakingPool.sol";

contract CommunityDAO {
    StakingPool public stakingPool;

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 voteCount; // Weighted votes
        bool executed;
    }

    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, address indexed proposer, string description);
    event Voted(uint256 indexed id, address indexed voter, uint256 weight);

    constructor(address _stakingPool) {
        stakingPool = StakingPool(payable(_stakingPool));
    }

    function createProposal(string calldata _description) external {
        uint256 id = proposals.length;
        proposals.push(
            Proposal({id: id, proposer: msg.sender, description: _description, voteCount: 0, executed: false})
        );
        emit ProposalCreated(id, msg.sender, _description);
    }

    function vote(uint256 _proposalId) external {
        require(_proposalId < proposals.length, "Invalid proposal");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        // Get voting power from Staking Pool (Weighted Stake)
        (, uint256 weightedStake,) = stakingPool.stakes(msg.sender);
        require(weightedStake > 0, "Must have staked tokens to vote");

        proposals[_proposalId].voteCount += weightedStake;
        hasVoted[_proposalId][msg.sender] = true;

        emit Voted(_proposalId, msg.sender, weightedStake);
    }

    function getProposals() external view returns (Proposal[] memory) {
        return proposals;
    }

    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }
}
