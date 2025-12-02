import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  foundry,
} from 'wagmi/chains';
import { tenderlyChain } from './tenderlyConfig';

export const config = getDefaultConfig({
  appName: 'Two-Token DeFi Platform',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    tenderlyChain, // Added Tenderly Chain
    baseSepolia,
    sepolia,
    arbitrumSepolia,
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    foundry,
  ],
  ssr: true,
});
