// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NexusNFT is ERC721, Ownable {
    uint256 public nextTokenId;

    // Tiers
    uint8 public constant TIER_GOLD = 1;
    uint8 public constant TIER_PLATINUM = 2;
    uint8 public constant TIER_DIAMOND = 3;

    // Prices
    uint256 public goldPrice = 0.01 ether;
    uint256 public platinumPrice = 0.05 ether;
    uint256 public diamondPrice = 0.1 ether;

    // Token Data
    mapping(uint256 => uint8) public tokenTiers;
    mapping(address => mapping(uint8 => uint256)) public userTierBalances;

    constructor() ERC721("Nexus Founder Card", "NEXCARD") Ownable(msg.sender) {}

    function mint(uint8 tier) external payable {
        uint256 price;
        if (tier == TIER_GOLD) price = goldPrice;
        else if (tier == TIER_PLATINUM) price = platinumPrice;
        else if (tier == TIER_DIAMOND) price = diamondPrice;
        else revert("Invalid tier");

        require(msg.value >= price, "Insufficient ETH sent");

        uint256 tokenId = nextTokenId++;
        tokenTiers[tokenId] = tier;
        _safeMint(msg.sender, tokenId);
    }

    function setPrices(uint256 _gold, uint256 _platinum, uint256 _diamond) external onlyOwner {
        goldPrice = _gold;
        platinumPrice = _platinum;
        diamondPrice = _diamond;
    }

    function withdraw() external onlyOwner {
        (bool success,) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    function getUserTiers(address user) external view returns (bool hasGold, bool hasPlatinum, bool hasDiamond) {
        hasGold = userTierBalances[user][TIER_GOLD] > 0;
        hasPlatinum = userTierBalances[user][TIER_PLATINUM] > 0;
        hasDiamond = userTierBalances[user][TIER_DIAMOND] > 0;
    }

    // Override _update to track balances per tier
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);

        uint8 tier = tokenTiers[tokenId];
        if (tier != 0) {
            if (from != address(0)) {
                userTierBalances[from][tier]--;
            }
            if (to != address(0)) {
                userTierBalances[to][tier]++;
            }
        }

        return from;
    }
}
