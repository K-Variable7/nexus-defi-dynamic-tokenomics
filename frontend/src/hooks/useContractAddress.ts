import { useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES, CHAIN_IDS } from '../constants';

type ContractName = keyof typeof CONTRACT_ADDRESSES[typeof CHAIN_IDS.SEPOLIA];

export function useContractAddress(contractName: ContractName) {
  const chainId = useChainId();
  
  // Default to Sepolia if chain not supported or addresses not defined
  const addresses = CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[CHAIN_IDS.SEPOLIA];
  
  return addresses[contractName];
}
