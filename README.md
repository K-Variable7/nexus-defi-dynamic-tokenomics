# 🌌 Nexus Trading Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.19-363636.svg?logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC.svg?logo=tailwind-css)
![Foundry](https://img.shields.io/badge/Built%20with-Foundry-orange.svg)

A next-generation DeFi platform featuring a **Glassmorphism UI**, **Pair-Based Prediction Markets**, and a **Gamified Vault System**.

## ✨ Key Features

### 🔮 Advanced Prediction Markets
- **Binary Options**: Bet on price movements (UP/DOWN) for assets like ETH.
- **Pair Markets**: *New!* Bet on the relative performance of assets (e.g., "Will ETH outperform BTC?").
- **Chainlink Integration**: Powered by decentralized price feeds for provable fairness.

### 🎨 Immersive UI/UX
- **Glassmorphism Design**: Sleek, translucent panels with dynamic lighting.
- **Interactive Backgrounds**: Parallax starfield effects for a deep, space-themed atmosphere.
- **Real-time Animations**: Smooth transitions powered by Framer Motion.

### 🏦 DeFi Ecosystem
- **Nexus Token (NEX)**: The core utility token for the ecosystem.
- **Staking Pool**: Earn yield on your NEX tokens.
- **Founder Card NFT**: ERC-721 NFT that boosts staking APY by **10%** (three tiers: Gold, Platinum, Diamond).
- **Liquidity Locker**: Secure token locking mechanisms.

### 🎮 Gamification
- **Team Battle Vault**: Join a team (Red, Blue, Green), deposit ETH, and compete. The winning team takes 95% of the pot!
- **Nexus Arcade**: Play European Roulette and a Daily Lottery with on-chain referral rewards.
- **Social Hub**: Governance voting and community suggestion boards.

## 🛠 Tech Stack

- **Smart Contracts**: Solidity, Foundry (Forge/Anvil/Cast)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Web3 Integration**: Wagmi, Viem, RainbowKit
- **Oracles**: Chainlink Data Feeds, Chainlink VRF

## 🚀 Setup & Installation

### Smart Contracts
1. Install Foundry:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash && foundryup
   ```
2. Install dependencies and build:
   ```bash
   cd contracts
   forge install
   forge build
   ```

### Local Development (Anvil)
1. Start a local blockchain node:
   ```bash
   anvil
   ```
2. Deploy contracts (in a new terminal):
   ```bash
   cd contracts
   forge script script/DeployLocal.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
   ```
3. Copy the deployed contract addresses to `frontend/src/constants.ts`.

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Deployment

### Deployed Addresses (Sepolia)

- **Nexus Token**: `0x7784fF80C9D58686956428352734A8a28637B84C`
- **Staking Pool**: `0x17bD6cCB9d98974eDE38311fC2930e88cC84C005`
- **Lottery**: `0x92E86e35CB294D6E472E5095C11fb77bA9b2BD2b`
- **NFT**: `0x29d25b648fE0b44021e14EA07C1637eC79c86f5a`
- **Prediction Market**: `0xC6cae6DE869D9834ACCb81a0A2C8bCD5b1F4F8f4`
- **Roulette**: `0xd05b7919189DfB09904E6183ff062942eDE565B0`
- **Community DAO**: `0xd06b8945984AeDD9552A7DCD40875bdA42D38470`
- **Team Battle Vault**: `0xb6C9F61d81C6c6A7827B255d963B43a107f4754b`
- **Liquidity Locker**: `0xAE209F8df0b13Eaf52cD58483371e477106D06dE`
- **Suggestions Board**: `0x8C14e8827ba62aE11F00C54E2Fd13543460E8E85`

### Deployed Addresses (Local Anvil)
- **Roulette**: \`0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9\`
- **Suggestions**: \`0x5FbDB2315678afecb367f032d93F642f64180aa3\`
- **CommunityDAO**: \`0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512\`

### Contracts (Sepolia)
```bash
cd contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

### Frontend
Deploy to Vercel or Netlify. Ensure environment variables are set for `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`.

## License
MIT

---

## ⚠️ Disclaimer

This project is for **educational and portfolio purposes only**. The smart contracts have **NOT** been audited by a professional security firm. 

While extensive testing (unit, integration, and fuzzing) has been performed, using this software on a mainnet environment carries significant risk. The authors accept no liability for any funds lost due to bugs, exploits, or market volatility. Use at your own risk.
