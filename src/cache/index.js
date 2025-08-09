// BizenDAO Cache Module - Main Export File

export { BizenDAOCache, bizenCache } from './bizenDAOCache.js';
export { CachedJsonRpcProvider, createCachedProvider, createCachedContract } from './cachedProvider.js';
export { CACHE_CONFIG, getTTL, shouldCache } from './config.js';

// Cache management utilities
export const cacheUtils = {
  // Clear all caches
  async clearAll() {
    const { bizenCache } = await import('./bizenDAOCache.js');
    return bizenCache.clearAll();
  },
  
  // Get cache metrics
  async getMetrics() {
    const { bizenCache } = await import('./bizenDAOCache.js');
    return bizenCache.getMetrics();
  },
  
  // Handle token burn
  async handleBurn(tokenId, creator) {
    const { bizenCache } = await import('./bizenDAOCache.js');
    return bizenCache.handleTokenBurn(tokenId, creator);
  }
};