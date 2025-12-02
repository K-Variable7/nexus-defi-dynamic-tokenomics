// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Governance
 * @author Nexus DeFi Team -- (variable.k)
 * @notice Simple governance contract for voting on platform parameters.
 * @dev Allows StakedToken holders to create and vote on proposals.
 */
contract Governance is Ownable {
    IERC20 public governanceToken; // StakedToken

    struct Proposal {
        uint256 id;
        string description;
        uint256 newTeamSplit;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 endTime;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;
    uint256 public votingPeriod = 7 days;

    event ProposalCreated(uint256 id, string description, uint256 newSplit);
    event Voted(uint256 id, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 id);

    constructor(address _governanceToken) Ownable(msg.sender) {
        governanceToken = IERC20(_governanceToken);
    }

    function createProposal(string memory description, uint256 newTeamSplit) external onlyOwner {
        require(newTeamSplit <= 10000, "Invalid split");
        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            description: description,
            newTeamSplit: newTeamSplit,
            votesFor: 0,
            votesAgainst: 0,
            endTime: block.timestamp + votingPeriod,
            executed: false
        });
        emit ProposalCreated(proposalCount, description, newTeamSplit);
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        hasVoted[proposalId][msg.sender] = true;
        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }
        emit Voted(proposalId, msg.sender, support, weight);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal rejected");

        // In real scenario, call the token contract to update
        // For demo, just mark executed
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }
}
