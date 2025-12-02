// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Lottery.sol";
import "../src/VariableTaxToken.sol";

contract TestLottery is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address lotteryAddress = 0x92E86e35CB294D6E472E5095C11fb77bA9b2BD2b;
        address tokenAddress = 0x7784fF80C9D58686956428352734A8a28637B84C;

        Lottery lottery = Lottery(lotteryAddress);
        VariableTaxToken token = VariableTaxToken(payable(tokenAddress));

        vm.startBroadcast(deployerPrivateKey);

        // 1. Approve
        uint256 ticketPrice = lottery.ticketPrice();
        console.log("Ticket Price:", ticketPrice);

        token.approve(lotteryAddress, ticketPrice * 10);
        console.log("Approved Lottery");

        // 2. Play
        try lottery.play(address(0)) {
            console.log("Play Successful!");
        } catch Error(string memory reason) {
            console.log("Play Failed with reason:", reason);
        } catch {
            console.log("Play Failed with unknown reason");
        }

        vm.stopBroadcast();
    }
}
