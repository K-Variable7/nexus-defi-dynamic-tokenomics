// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PredictionMarket is Ownable, ReentrancyGuard {
    enum Position {
        Bull,
        Bear
    }

    struct Round {
        uint256 epoch;
        uint256 startTimestamp;
        uint256 lockTimestamp;
        uint256 closeTimestamp;
        int256 lockPrice;
        int256 closePrice;
        int256 lockPriceB; // For Pairs
        int256 closePriceB; // For Pairs
        uint256 totalAmount;
        uint256 bullAmount;
        uint256 bearAmount;
        bool oracleCalled;
        bool closed;
    }

    struct BetInfo {
        Position position;
        uint256 amount;
        bool claimed;
    }

    struct MarketInfo {
        string symbol;
        uint256 currentEpoch;
        uint256 intervalSeconds;
        AggregatorV3Interface oracle;
        AggregatorV3Interface oracleB; // For Pairs
        bool isPair;
        bool isActive;
    }

    // Mappings
    mapping(string => MarketInfo) public markets;
    mapping(string => mapping(uint256 => Round)) public rounds;
    mapping(string => mapping(uint256 => mapping(address => BetInfo))) public bets;
    mapping(address => mapping(string => uint256[])) public userBets;
    mapping(address => uint256) public userWins; // Track total wins

    string[] public marketSymbols;

    event MarketAdded(string symbol, address oracle, uint256 interval);
    event PairMarketAdded(string symbol, address oracleA, address oracleB, uint256 interval);
    event BetPlaced(
        string indexed symbol, uint256 indexed epoch, address indexed sender, Position position, uint256 amount
    );
    event RoundEnded(string indexed symbol, uint256 indexed epoch, int256 price, int256 priceB);
    event Claimed(string indexed symbol, uint256 indexed epoch, address indexed sender, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function addMarket(string memory _symbol, address _oracle, uint256 _intervalSeconds) external onlyOwner {
        require(address(markets[_symbol].oracle) == address(0), "Market exists");

        markets[_symbol] = MarketInfo({
            symbol: _symbol,
            currentEpoch: 0,
            intervalSeconds: _intervalSeconds,
            oracle: AggregatorV3Interface(_oracle),
            oracleB: AggregatorV3Interface(address(0)),
            isPair: false,
            isActive: true
        });
        marketSymbols.push(_symbol);

        _startRound(_symbol, 0);
        emit MarketAdded(_symbol, _oracle, _intervalSeconds);
    }

    function addPairMarket(string memory _symbol, address _oracleA, address _oracleB, uint256 _intervalSeconds) external onlyOwner {
        require(address(markets[_symbol].oracle) == address(0), "Market exists");

        markets[_symbol] = MarketInfo({
            symbol: _symbol,
            currentEpoch: 0,
            intervalSeconds: _intervalSeconds,
            oracle: AggregatorV3Interface(_oracleA),
            oracleB: AggregatorV3Interface(_oracleB),
            isPair: true,
            isActive: true
        });
        marketSymbols.push(_symbol);

        _startRound(_symbol, 0);
        emit PairMarketAdded(_symbol, _oracleA, _oracleB, _intervalSeconds);
    }

    function _startRound(string memory _symbol, uint256 _epoch) internal {
        Round storage round = rounds[_symbol][_epoch];
        round.epoch = _epoch;
        round.startTimestamp = block.timestamp;
        round.lockTimestamp = block.timestamp + markets[_symbol].intervalSeconds;
        round.closeTimestamp = block.timestamp + (2 * markets[_symbol].intervalSeconds);
        round.totalAmount = 0;
    }

    function bet(string memory _symbol, uint8 _position) external payable nonReentrant {
        require(markets[_symbol].isActive, "Market inactive");
        require(msg.value > 0, "Bet amount must be > 0");

        uint256 epoch = markets[_symbol].currentEpoch;
        Round storage round = rounds[_symbol][epoch];

        require(block.timestamp < round.lockTimestamp, "Round locked");

        if (_position == 0) {
            round.bullAmount += msg.value;
        } else {
            round.bearAmount += msg.value;
        }
        round.totalAmount += msg.value;

        BetInfo storage betInfo = bets[_symbol][epoch][msg.sender];
        betInfo.position = Position(_position);
        betInfo.amount += msg.value;

        userBets[msg.sender][_symbol].push(epoch);

        emit BetPlaced(_symbol, epoch, msg.sender, Position(_position), msg.value);
    }

    function executeRound(string memory _symbol) external nonReentrant {
        MarketInfo storage market = markets[_symbol];
        uint256 epoch = market.currentEpoch;
        Round storage round = rounds[_symbol][epoch];

        require(block.timestamp >= round.lockTimestamp, "Round not locked");
        require(!round.closed, "Round already closed");

        // Get Price A
        (, int256 currentPrice,,,) = market.oracle.latestRoundData();
        
        // Get Price B if pair
        int256 currentPriceB = 0;
        if (market.isPair) {
            (, currentPriceB,,,) = market.oracleB.latestRoundData();
        }

        if (round.lockPrice == 0) {
            // Locking the round
            round.lockPrice = currentPrice;
            if (market.isPair) round.lockPriceB = currentPriceB;
            
            round.oracleCalled = true;

            // Start next round
            market.currentEpoch++;
            _startRound(_symbol, market.currentEpoch);
        } else if (block.timestamp >= round.closeTimestamp) {
            // Ending the round
            round.closePrice = currentPrice;
            if (market.isPair) round.closePriceB = currentPriceB;
            
            round.closed = true;
            emit RoundEnded(_symbol, epoch, currentPrice, currentPriceB);
        }
    }

    function claim(string memory _symbol, uint256 _epoch) external nonReentrant {
        Round storage round = rounds[_symbol][_epoch];
        require(round.closed, "Round not closed");

        BetInfo storage betInfo = bets[_symbol][_epoch][msg.sender];
        require(betInfo.amount > 0, "No bet");
        require(!betInfo.claimed, "Already claimed");

        uint256 reward = 0;
        bool won = false;

        if (markets[_symbol].isPair) {
            // Pair Logic: Compare % change
            // (Close - Lock) / Lock
            // We can compare (CloseA * LockB) vs (CloseB * LockA) to avoid division if we assume positive prices
            // ChangeA > ChangeB <=> CloseA/LockA > CloseB/LockB <=> CloseA * LockB > CloseB * LockA
            
            int256 valA = round.closePrice * round.lockPriceB;
            int256 valB = round.closePriceB * round.lockPrice;

            if (valA > valB && betInfo.position == Position.Bull) { // Bull = A wins
                won = true;
            } else if (valB > valA && betInfo.position == Position.Bear) { // Bear = B wins
                won = true;
            }
        } else {
            // Standard Logic
            if (round.closePrice > round.lockPrice && betInfo.position == Position.Bull) {
                won = true;
            } else if (round.closePrice < round.lockPrice && betInfo.position == Position.Bear) {
                won = true;
            }
        }

        if (won) {
            uint256 pool = betInfo.position == Position.Bull ? round.bullAmount : round.bearAmount;
            if (pool > 0) {
                reward = (betInfo.amount * round.totalAmount) / pool;
            }
            userWins[msg.sender]++;
        }

        betInfo.claimed = true;

        if (reward > 0) {
            (bool success,) = payable(msg.sender).call{value: reward}("");
            require(success, "Transfer failed");
            emit Claimed(_symbol, _epoch, msg.sender, reward);
        }
    }

    function getMarketSymbols() external view returns (string[] memory) {
        return marketSymbols;
    }
}
