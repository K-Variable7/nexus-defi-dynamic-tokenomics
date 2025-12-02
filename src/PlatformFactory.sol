// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./VariableTaxToken.sol";
import "./StakingPool.sol";
import "./StakedToken.sol";
import "./NexusNFT.sol";

contract PlatformFactory {
    event PlatformCreated(address indexed token, address indexed pool, address indexed stakedToken, address nft);

    function createPlatform(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner,
        address router
    ) external returns (address, address, address, address) {
        // 1. Deploy Token
        VariableTaxToken token = new VariableTaxToken(name, symbol, owner, address(0), initialSupply, router);

        // 2. Deploy NFT
        NexusNFT nft = new NexusNFT();

        // 3. Deploy Staking Pool
        StakingPool pool = new StakingPool(address(token), address(nft));

        // 4. Deploy Staked Token (Receipt Token)
        StakedToken stakedToken = new StakedToken(string.concat("Staked ", name), string.concat("s", symbol));

        // 5. Configure Permissions
        // Set Staking Pool as the tax recipient (or part of it) - Logic depends on Token
        // For now, we just return the addresses. Wiring is done by the deployer/owner.

        // Note: In a real factory, we might transfer ownership to the caller.
        token.transfer(owner, initialSupply);
        token.transferOwnership(owner);
        nft.transferOwnership(owner);
        // pool.transferOwnership(owner); // If StakingPool is Ownable

        emit PlatformCreated(address(token), address(pool), address(stakedToken), address(nft));

        return (address(token), address(pool), address(stakedToken), address(nft));
    }
}
