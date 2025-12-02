import { TENDERLY_CHAIN_ID } from './tenderlyConfig';

export const ROUTER_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as const; // Local MockRouter
export const TOKEN_ADDRESS = "0x61c36a8d610163660E21a8b7359e1Cac0C9133e1" as const; // Local Token
export const LOTTERY_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318" as const; // Local Lottery
export const STAKING_POOL_ADDRESS = "0x6743E5c6E1B453372507E8dfD6CA53508721425B" as const; // Local Platform
export const NFT_ADDRESS = "0x23dB4a08f2272df049a4932a4Cc3A6Dc1002B33E" as const; // Local NFT
export const PREDICTION_ADDRESS = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c" as const; // Local PredictionMarket
export const ROULETTE_ADDRESS = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788" as const; // Local Roulette
export const WETH_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" as const; // Local MockWETH
export const VAULT_ADDRESS = "0x8EFa1819Ff5B279077368d44B593a4543280e402" as const; // Local Vault
export const LIQUIDITY_LOCKER_ADDRESS = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1" as const; // Local LiquidityLocker
export const MOCK_LP_ADDRESS = "0x0B306BF915C4d645ff596e518fAf3F9669b97016" as const; // Local MockLP

export const CHAIN_IDS = {
  SEPOLIA: 11155111,
  BASE_SEPOLIA: 84532,
  ARBITRUM_SEPOLIA: 421614,
  ANVIL: 31337,
} as const;

export const CONTRACT_ADDRESSES: Record<number, {
  ROUTER: `0x${string}`;
  TOKEN: `0x${string}`;
  LOTTERY: `0x${string}`;
  STAKING: `0x${string}`;
  NFT: `0x${string}`;
  PREDICTION: `0x${string}`;
  ROULETTE: `0x${string}`;
  WETH: `0x${string}`;
  SUGGESTIONS: `0x${string}`;
  DAO: `0x${string}`;
  VAULT: `0x${string}`;
  LIQUIDITY_LOCKER?: `0x${string}`;
  MOCK_LP?: `0x${string}`;
}> = {
  [CHAIN_IDS.SEPOLIA]: {
    ROUTER: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
    TOKEN: "0x7784fF80C9D58686956428352734A8a28637B84C",
    LOTTERY: "0x92E86e35CB294D6E472E5095C11fb77bA9b2BD2b",
    STAKING: "0x17bD6cCB9d98974eDE38311fC2930e88cC84C005",
    NFT: "0x29d25b648fE0b44021e14EA07C1637eC79c86f5a",
    PREDICTION: "0xC6cae6DE869D9834ACCb81a0A2C8bCD5b1F4F8f4",
    ROULETTE: "0xd05b7919189DfB09904E6183ff062942eDE565B0",
    WETH: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
    SUGGESTIONS: "0x8C14e8827ba62aE11F00C54E2Fd13543460E8E85",
    DAO: "0xd06b8945984AeDD9552A7DCD40875bdA42D38470",
    VAULT: "0xb6C9F61d81C6c6A7827B255d963B43a107f4754b",
    LIQUIDITY_LOCKER: "0xAE209F8df0b13Eaf52cD58483371e477106D06dE",
    MOCK_LP: "0x0767d6598CD125F090358C2ae35270508c890A35",
  },
  [CHAIN_IDS.ANVIL]: {
    ROUTER: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9", 
    TOKEN: "0x61c36a8d610163660E21a8b7359e1Cac0C9133e1",
    LOTTERY: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318", 
    STAKING: "0x6743E5c6E1B453372507E8dfD6CA53508721425B",
    NFT: "0x23dB4a08f2272df049a4932a4Cc3A6Dc1002B33E",
    PREDICTION: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
    ROULETTE: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
    WETH: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    SUGGESTIONS: "0x0000000000000000000000000000000000000000",
    DAO: "0x0000000000000000000000000000000000000000",
    VAULT: "0x8EFa1819Ff5B279077368d44B593a4543280e402",
    LIQUIDITY_LOCKER: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
    MOCK_LP: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
  },
  [CHAIN_IDS.BASE_SEPOLIA]: {
    ROUTER: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    TOKEN: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    LOTTERY: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    STAKING: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    NFT: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    PREDICTION: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    ROULETTE: "0x0C5ee2e321096A3d79C7b355246fbC81c90914B6",
    WETH: "0x4200000000000000000000000000000000000006", // Base Sepolia WETH
    SUGGESTIONS: "0xE7e5DFB560F1461a230d935ee5F550d802A39015",
    DAO: "0x5bF731De14Ae577e58Fe68F05232c8EcB4885CDf",
    VAULT: "0x0000000000000000000000000000000000000000", // TODO: Deploy
  },
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    ROUTER: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    TOKEN: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    LOTTERY: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    STAKING: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    NFT: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    PREDICTION: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    ROULETTE: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    WETH: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73", // Arbitrum Sepolia WETH
    SUGGESTIONS: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    DAO: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    VAULT: "0x0000000000000000000000000000000000000000", // TODO: Deploy
  }
};

export const MULTIPLIER_VAULT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_vrfCoordinator", "type": "address" },
      { "internalType": "uint64", "name": "_subscriptionId", "type": "uint64" },
      { "internalType": "bytes32", "name": "_keyHash", "type": "bytes32" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "uint8", "name": "_team", "type": "uint8" },
      { "internalType": "address", "name": "_referrer", "type": "address" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "closeRound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_roundId", "type": "uint256" }],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentRoundId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_roundId", "type": "uint256" }],
    "name": "getRound",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "uint256", "name": "endTime", "type": "uint256" },
          { "internalType": "uint256", "name": "totalPool", "type": "uint256" },
          { "internalType": "bool", "name": "isClosed", "type": "bool" },
          { "internalType": "bool", "name": "isResolved", "type": "bool" },
          { "internalType": "uint256", "name": "randomWord", "type": "uint256" },
          { "internalType": "uint8", "name": "winningTeam", "type": "uint8" },
          { "internalType": "uint256", "name": "bonusAmount", "type": "uint256" }
        ],
        "internalType": "struct MultiplierVault.VaultRound",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_roundId", "type": "uint256" }],
    "name": "getTeamPools",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "userDeposits",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "userTeams",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const ROULETTE_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_vrfCoordinator", "type": "address" },
      { "internalType": "uint64", "name": "_subscriptionId", "type": "uint64" },
      { "internalType": "bytes32", "name": "_keyHash", "type": "bytes32" },
      { "internalType": "address", "name": "_treasury", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "enum Roulette.Color", "name": "_color", "type": "uint8" }],
    "name": "bet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_roundId", "type": "uint256" }],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentRoundId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_number", "type": "uint256" }],
    "name": "getColor",
    "outputs": [{ "internalType": "enum Roulette.Color", "name": "", "type": "uint8" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_roundId", "type": "uint256" }],
    "name": "getRound",
    "outputs": [
      { "internalType": "uint256", "name": "totalPool", "type": "uint256" },
      { "internalType": "uint256", "name": "greenPool", "type": "uint256" },
      { "internalType": "uint256", "name": "redPool", "type": "uint256" },
      { "internalType": "uint256", "name": "blackPool", "type": "uint256" },
      { "internalType": "bool", "name": "isResolved", "type": "bool" },
      { "internalType": "uint256", "name": "winningNumber", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "spinWheel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "rounds",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "totalPool", "type": "uint256" },
      { "internalType": "uint256", "name": "winningNumber", "type": "uint256" },
      { "internalType": "enum Roulette.Color", "name": "winningColor", "type": "uint8" },
      { "internalType": "bool", "name": "isClosed", "type": "bool" },
      { "internalType": "bool", "name": "isResolved", "type": "bool" },
      { "internalType": "uint256", "name": "rolloverAmount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "enum Roulette.Color", "name": "", "type": "uint8" }
    ],
    "name": "userBets",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "enum Roulette.Color", "name": "color", "type": "uint8" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "winningNumber", "type": "uint256" },
      { "indexed": false, "internalType": "enum Roulette.Color", "name": "winningColor", "type": "uint8" },
      { "indexed": false, "internalType": "uint256", "name": "totalPool", "type": "uint256" }
    ],
    "name": "RoundResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256" }
    ],
    "name": "WheelSpun",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "WinningsClaimed",
    "type": "event"
  }
] as const;

export const SUGGESTIONS_ADDRESS = "0x8C14e8827ba62aE11F00C54E2Fd13543460E8E85" as const;

export const SUGGESTIONS_ABI = [
  {
    "inputs": [{ "internalType": "string", "name": "_message", "type": "string" }],
    "name": "postSuggestion",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSuggestions",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "string", "name": "message", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct Suggestions.Suggestion[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "message", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "SuggestionCreated",
    "type": "event"
  }
] as const;

export const PREDICTION_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "epoch",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum PredictionMarket.Position",
        "name": "position",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "epoch",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Claimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "oracle",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "interval",
        "type": "uint256"
      }
    ],
    "name": "MarketAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "epoch",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "int256",
        "name": "price",
        "type": "int256"
      }
    ],
    "name": "RoundEnded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_oracle",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_intervalSeconds",
        "type": "uint256"
      }
    ],
    "name": "addMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_oracleA",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_oracleB",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_intervalSeconds",
        "type": "uint256"
      }
    ],
    "name": "addPairMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_position",
        "type": "uint8"
      }
    ],
    "name": "bet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "bets",
    "outputs": [
      {
        "internalType": "enum PredictionMarket.Position",
        "name": "position",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "claimed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_epoch",
        "type": "uint256"
      }
    ],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      }
    ],
    "name": "executeRound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMarketSymbols",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "marketSymbols",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "markets",
    "outputs": [
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "currentEpoch",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "intervalSeconds",
        "type": "uint256"
      },
      {
        "internalType": "contract AggregatorV3Interface",
        "name": "oracle",
        "type": "address"
      },
      {
        "internalType": "contract AggregatorV3Interface",
        "name": "oracleB",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isPair",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "rounds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "epoch",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lockTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "closeTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "int256",
        "name": "lockPrice",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "closePrice",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "totalAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "bullAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "bearAmount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "oracleCalled",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "closed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userBets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const STAKING_POOL_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "applyBoost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "pendingReward",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getBoostMultiplier",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "stakes",
    "outputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "weightedAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalWeightedStaked",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const LOTTERY_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "referrer", "type": "address" }],
    "name": "play",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ticketPrice",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "referrer", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "won", "type": "bool" }
    ],
    "name": "TicketPurchased",
    "type": "event"
  }
] as const;

export const NFT_ABI = [
  {
    "inputs": [{ "internalType": "uint8", "name": "tier", "type": "uint8" }],
    "name": "mint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "goldPrice",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platinumPrice",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "diamondPrice",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserTiers",
    "outputs": [
      { "internalType": "bool", "name": "hasGold", "type": "bool" },
      { "internalType": "bool", "name": "hasPlatinum", "type": "bool" },
      { "internalType": "bool", "name": "hasDiamond", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const ROUTER_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" }
    ],
    "name": "getAmountsOut",
    "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactTokensForETHSupportingFeeOnTransferTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const ERC20_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const DAO_ADDRESS = "0xd06b8945984AeDD9552A7DCD40875bdA42D38470" as const;

export const DAO_ABI = [
  {
    "inputs": [{ "internalType": "string", "name": "_description", "type": "string" }],
    "name": "createProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_proposalId", "type": "uint256" }],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProposals",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "proposer", "type": "address" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "voteCount", "type": "uint256" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" },
          { "internalType": "bool", "name": "executed", "type": "bool" },
          { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "internalType": "struct CommunityDAO.ProposalView[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "proposer", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "description", "type": "string" }
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "voter", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "weight", "type": "uint256" }
    ],
    "name": "Voted",
    "type": "event"
  }
] as const;

export const LIQUIDITY_LOCKER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_stakingToken", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "lockIndex", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "unlockDate", "type": "uint256" }
    ],
    "name": "Deposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "RewardClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "penalty", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" }
    ],
    "name": "Withdrawn",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "accEthPerShare",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_lockIndex", "type": "uint256" }],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_amount", "type": "uint256" },
      { "internalType": "uint8", "name": "_durationType", "type": "uint8" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_lockIndex", "type": "uint256" }
    ],
    "name": "getPendingReward",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getUserLocks",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "weightedAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "lockDate", "type": "uint256" },
          { "internalType": "uint256", "name": "unlockDate", "type": "uint256" },
          { "internalType": "uint256", "name": "multiplier", "type": "uint256" },
          { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" }
        ],
        "internalType": "struct LiquidityLocker.LockInfo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stakingToken",
    "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_lockIndex", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
