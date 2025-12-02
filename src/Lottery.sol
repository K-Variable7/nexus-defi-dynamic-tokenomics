// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Lottery is Ownable, ReentrancyGuard {
    IERC20 public token;
    uint256 public ticketPrice = 100 ether; // 100 NEX
    uint256 public roundId;

    struct Ticket {
        address player;
        address referrer;
    }

    Ticket[] public tickets;

    event TicketPurchased(address indexed player, address indexed referrer, bool won);
    event WinnerPicked(address indexed winner, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    function play(address referrer) external nonReentrant {
        token.transferFrom(msg.sender, address(this), ticketPrice);

        if (referrer != address(0) && referrer != msg.sender) {
            // 10% referral reward
            uint256 commission = (ticketPrice * 10) / 100;
            token.transfer(referrer, commission);
        }

        tickets.push(Ticket(msg.sender, referrer));

        // Instant win for demo purposes?
        // The UI expects a "won" boolean in the event.
        // "const won = (event.args as any).won;"
        // "Win Chance: 20% (Pays 50% of Pot)"

        bool won = false;
        if (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, tickets.length))) % 5 == 0) {
            won = true;
            uint256 balance = token.balanceOf(address(this));
            uint256 prize = balance / 2;
            if (prize > 0) {
                token.transfer(msg.sender, prize);
            }
        }

        emit TicketPurchased(msg.sender, referrer, won);
    }

    function setTicketPrice(uint256 _price) external onlyOwner {
        ticketPrice = _price;
    }
}
