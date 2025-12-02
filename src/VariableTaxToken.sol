// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VariableTaxToken
 * @author Nexus DeFi Team -- (variable.k)
 * @notice ERC20 token with dynamic volume-based tax tiers and automated buybacks.
 * @dev Implements tax collection, volume tracking, and Uniswap V2 integration for ETH buybacks.
 */
interface IUniswapV2Router02 {
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
}

contract VariableTaxToken is ERC20, ERC20Burnable, Ownable {
    uint256 public totalVolume;
    uint256 public lastResetTime;
    uint256 public constant RESET_PERIOD = 1 days;

    // Analytics
    mapping(address => uint256) public userTradingVolume;

    IUniswapV2Router02 public uniswapRouter;
    address public uniswapPair;
    bool public swapEnabled = true;
    bool private inSwap;
    uint256 public swapThreshold = 1000 * 10**18; // 1000 Tokens threshold

    modifier lockTheSwap {
        inSwap = true;
        _;
        inSwap = false;
    }

    struct TaxTier {
        uint256 minVolume;
        uint256 maxVolume;
        uint256 taxRate; // in basis points (e.g., 500 = 5%)
    }

    TaxTier[] public taxTiers;

    address public teamWallet;
    address public buybackPool;
    address public lotteryPool;

    uint256 public teamSplit = 4000; // 40%
    uint256 public lotterySplit = 1000; // 10%
    // Remaining 50% goes to buyback

    mapping(address => bool) public isExcludedFromTax;

    event TaxDistributed(uint256 amount, uint256 teamAmount, uint256 buybackAmount, uint256 lotteryAmount);

    constructor(
        string memory name,
        string memory symbol,
        address _teamWallet,
        address _buybackPool,
        uint256 initialSupply,
        address _router
    ) ERC20(name, symbol) Ownable(msg.sender) {
        teamWallet = _teamWallet;
        buybackPool = _buybackPool;
        
        if (_router != address(0)) {
            uniswapRouter = IUniswapV2Router02(_router);
        }

        isExcludedFromTax[msg.sender] = true;
        isExcludedFromTax[address(this)] = true;
        _mint(msg.sender, initialSupply);

        // Default tiers
        taxTiers.push(TaxTier(0, 999 ether, 200)); // 2%
        taxTiers.push(TaxTier(1000 ether, 10000 ether, 500)); // 5%
        taxTiers.push(TaxTier(10000 ether, type(uint256).max, 1000)); // 10%
    }

    function _update(address from, address to, uint256 value) internal override(ERC20) {
        // Reset volume periodically
        if (block.timestamp >= lastResetTime + RESET_PERIOD) {
            totalVolume = 0;
            lastResetTime = block.timestamp;
        }

        if (isExcludedFromTax[from] || isExcludedFromTax[to]) {
            super._update(from, to, value);
            return;
        }

        if (from != address(0) && to != address(0)) { // Not mint/burn
            // Analytics
            userTradingVolume[from] += value;
            userTradingVolume[to] += value;

            uint256 tax = calculateTax(value);
            uint256 netAmount = value - tax;

            super._update(from, to, netAmount);

            if (tax > 0) {
                super._update(from, address(this), tax);
            }

            uint256 contractTokenBalance = balanceOf(address(this));
            bool overMinTokenBalance = contractTokenBalance >= swapThreshold;

            if (
                overMinTokenBalance &&
                !inSwap &&
                from != uniswapPair && // Don't swap on buys
                swapEnabled &&
                address(uniswapRouter) != address(0) &&
                uniswapPair != address(0)
            ) {
                swapAndDistribute(contractTokenBalance);
            }

            totalVolume += value;
        } else {
            super._update(from, to, value);
        }
    }

    function swapAndDistribute(uint256 taxAmount) private lockTheSwap {
        // Swap entire tax amount for ETH
        uint256 initialBalance = address(this).balance;
        swapTokensForEth(taxAmount);
        uint256 newBalance = address(this).balance - initialBalance;

        // Calculate ETH splits
        uint256 teamEth = (newBalance * teamSplit) / 10000;
        uint256 lotteryEth = (newBalance * lotterySplit) / 10000;
        uint256 buybackEth = newBalance - teamEth - lotteryEth;

        // Send ETH
        (bool successTeam, ) = teamWallet.call{value: teamEth}("");
        (bool successPool, ) = buybackPool.call{value: buybackEth}("");
        
        bool successLottery = true;
        if (lotteryPool != address(0)) {
            (successLottery, ) = lotteryPool.call{value: lotteryEth}("");
        }
        
        require(successTeam && successPool && successLottery, "ETH Transfer failed");
        
        emit TaxDistributed(taxAmount, teamEth, buybackEth, lotteryEth);
    }

    function swapTokensForEth(uint256 tokenAmount) private {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = uniswapRouter.WETH();

        _approve(address(this), address(uniswapRouter), tokenAmount);

        uniswapRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmount,
            0, // accept any amount of ETH
            path,
            address(this),
            block.timestamp
        );
    }

    function calculateTax(uint256 amount) public view returns (uint256) {
        uint256 currentVolume = totalVolume;
        for (uint256 i = 0; i < taxTiers.length; i++) {
            if (currentVolume >= taxTiers[i].minVolume && currentVolume <= taxTiers[i].maxVolume) {
                return (amount * taxTiers[i].taxRate) / 10000;
            }
        }
        return 0;
    }

    function distributeTax(uint256 tax) internal {
        uint256 teamAmount = (tax * teamSplit) / 10000;
        uint256 lotteryAmount = (tax * lotterySplit) / 10000;
        uint256 buybackAmount = tax - teamAmount - lotteryAmount;

        super._update(address(this), teamWallet, teamAmount);
        super._update(address(this), buybackPool, buybackAmount);
        
        if (lotteryPool != address(0)) {
            super._update(address(this), lotteryPool, lotteryAmount);
        }

        emit TaxDistributed(tax, teamAmount, buybackAmount, lotteryAmount);
    }

    function setLotteryPool(address _lotteryPool) external onlyOwner {
        lotteryPool = _lotteryPool;
    }

    function setUniswapPair(address _pair) external onlyOwner {
        uniswapPair = _pair;
    }

    function setSwapThreshold(uint256 _threshold) external onlyOwner {
        swapThreshold = _threshold;
    }

    function setRouter(address _router) external onlyOwner {
        uniswapRouter = IUniswapV2Router02(_router);
    }

    function setSwapEnabled(bool _enabled) external onlyOwner {
        swapEnabled = _enabled;
    }

    // Allow contract to receive ETH from Uniswap
    receive() external payable {}

    function setTaxTiers(TaxTier[] calldata _tiers) external onlyOwner {
        delete taxTiers;
        for (uint256 i = 0; i < _tiers.length; i++) {
            taxTiers.push(_tiers[i]);
        }
    }

    function setTeamSplit(uint256 _split) external onlyOwner {
        require(_split <= 10000, "Invalid split");
        teamSplit = _split;
    }

    function setBuybackPool(address _buybackPool) external onlyOwner {
        buybackPool = _buybackPool;
    }

    function setExcluded(address account, bool excluded) external onlyOwner {
        isExcludedFromTax[account] = excluded;
    }
}
