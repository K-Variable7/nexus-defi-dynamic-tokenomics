import { defineChain } from "viem";

// TODO: Update these values with your Tenderly Virtual Testnet details
// You can find these in your Tenderly Dashboard after creating a Virtual Testnet
export const TENDERLY_CHAIN_ID = 84532; // Defaulting to Base Sepolia ID if forking, or change to your custom ID
export const TENDERLY_RPC_URL = "https://virtual.base-sepolia.eu.rpc.tenderly.co/49dca045-ec72-4d42-af20-b783e6b24876"; 
 

export const tenderlyChain = defineChain({
  id: TENDERLY_CHAIN_ID,
  name: 'Tenderly Virtual Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Virtual ETH',
    symbol: 'vETH',
  },
  rpcUrls: {
    default: { http: [TENDERLY_RPC_URL] },
  },
  testnet: true,
});
