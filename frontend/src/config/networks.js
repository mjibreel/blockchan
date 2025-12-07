// Supported blockchain networks configuration
export const SUPPORTED_NETWORKS = {
  polygon_amoy: {
    chainId: 80002,
    name: 'Polygon Amoy',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
    faucetUrl: 'https://faucet.polygon.technology/',
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS_POLYGON || '0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA',
  },
  base_sepolia: {
    chainId: 84532,
    name: 'Base Sepolia',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org/'],
    faucetUrl: 'https://www.coinbase.com/faucets/base-ethereum-goerli-faucet',
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS_BASE || '', // Will need to deploy
  },
  ethereum_sepolia: {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    faucetUrl: 'https://www.alchemy.com/faucets/ethereum-sepolia',
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS_ETHEREUM || '', // Will need to deploy
  },
  arbitrum_sepolia: {
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
    faucetUrl: 'https://faucet.quicknode.com/arbitrum/sepolia',
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS_ARBITRUM || '', // Will need to deploy
  },
};

// Get network by chain ID
export function getNetworkByChainId(chainId) {
  return Object.values(SUPPORTED_NETWORKS).find(network => network.chainId === chainId);
}

// Get default network (Polygon Amoy)
export function getDefaultNetwork() {
  return SUPPORTED_NETWORKS.polygon_amoy;
}

// Get all supported chain IDs
export function getSupportedChainIds() {
  return Object.values(SUPPORTED_NETWORKS).map(network => network.chainId);
}

