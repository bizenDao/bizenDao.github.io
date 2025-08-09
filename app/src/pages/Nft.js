import { walletManager } from '../wallet';

export function NftPage() {
  const isConnected = walletManager.isConnected();
  
  return `
    <div class="page nft-page">
      <div class="page-header">
        <h1>NFT Collections</h1>
        <p class="page-subtitle">Explore and mint exclusive BizenDao NFTs</p>
      </div>
      
      <div class="nft-collections">
        <div class="collection-card">
          <div class="collection-image">
            <img src="/assets/logo.jpg" alt="Members Card" style="width: 100%; border-radius: 8px;">
          </div>
          <h3>BizenDao Members Card</h3>
          <p class="collection-description">Soul Bound Token for DAO members</p>
          <div class="collection-stats">
            <div class="stat">
              <span class="stat-label">Price</span>
              <span class="stat-value">FREE</span>
            </div>
            <div class="stat">
              <span class="stat-label">Type</span>
              <span class="stat-value">SBT</span>
            </div>
          </div>
          <button onclick="window.router.navigate('profile')" class="collection-button">
            ${isConnected ? 'Mint Now' : 'Connect Wallet'}
          </button>
        </div>
        
        <div class="collection-card upcoming">
          <div class="collection-image placeholder">
            <div class="coming-soon">Coming Soon</div>
          </div>
          <h3>BizenDao Genesis</h3>
          <p class="collection-description">Limited edition founding member NFTs</p>
          <div class="collection-stats">
            <div class="stat">
              <span class="stat-label">Price</span>
              <span class="stat-value">TBA</span>
            </div>
            <div class="stat">
              <span class="stat-label">Supply</span>
              <span class="stat-value">1000</span>
            </div>
          </div>
          <button class="collection-button" disabled>
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  `;
}