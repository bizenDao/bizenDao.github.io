// Environment-based configuration

// Development chain configuration
const DEVELOPMENT_CHAIN = {
  chainId: '0x52d1', // 21201 in hex
  chainName: 'BizenDao Private Chain',
  nativeCurrency: {
    name: 'DEV Token',
    symbol: 'DEV',
    decimals: 18
  },
  rpcUrls: ['http://dev2.bon-soleil.com/rpc'],
  blockExplorerUrls: [] // No block explorer for private chain
};

// Production chain configuration (Polygon Mainnet)
const PRODUCTION_CHAIN = {
  chainId: '0x89', // 137 in hex
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  },
  rpcUrls: ['https://polygon-rpc.com/', 'https://rpc-mainnet.maticvigil.com/'],
  blockExplorerUrls: ['https://polygonscan.com/']
};

// Determine current environment
export const isDevelopment = import.meta.env.VITE_ENV === 'development' || import.meta.env.DEV;

// Force private chain flag (set to true during development phase)
// TODO: Set to false when ready for production deployment on Polygon
export const FORCE_PRIVATE_CHAIN = true;

// Export the appropriate chain configuration
export const CHAIN_CONFIG = (isDevelopment || FORCE_PRIVATE_CHAIN) ? DEVELOPMENT_CHAIN : PRODUCTION_CHAIN;

// Contract address from environment variable or default
export const NFT_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890';

// Helper functions
export function getExplorerUrl(hash, type = 'tx') {
  if (!CHAIN_CONFIG.blockExplorerUrls || CHAIN_CONFIG.blockExplorerUrls.length === 0) {
    return null;
  }
  return `${CHAIN_CONFIG.blockExplorerUrls[0]}${type}/${hash}`;
}

export function getCurrencySymbol() {
  return CHAIN_CONFIG.nativeCurrency.symbol;
}