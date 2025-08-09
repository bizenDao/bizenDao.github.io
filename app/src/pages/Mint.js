export function MintPage() {
  return `
    <div class="page mint-page">
      <div class="page-header">
        <h1>Mint Station</h1>
        <p class="page-subtitle">Create and mint your own NFTs</p>
      </div>
      
      <div class="mint-container">
        <div class="mint-info">
          <h2>🚀 Launch Your NFT</h2>
          <p>BizenDao members can create and launch their own NFT collections through our platform.</p>
          
          <div class="mint-features">
            <div class="mint-feature">
              <span class="feature-icon">🎨</span>
              <h3>Custom Artwork</h3>
              <p>Upload your digital art or generative collections</p>
            </div>
            
            <div class="mint-feature">
              <span class="feature-icon">📊</span>
              <h3>Smart Contracts</h3>
              <p>Deploy secure, audited smart contracts</p>
            </div>
            
            <div class="mint-feature">
              <span class="feature-icon">💰</span>
              <h3>Revenue Share</h3>
              <p>Automatic royalty distribution to creators</p>
            </div>
          </div>
        </div>
        
        <div class="coming-soon-banner">
          <h2>🔨 Under Construction</h2>
          <p>The mint station is currently being built. Members will be notified when it's ready!</p>
          <div class="progress-bar">
            <div class="progress" style="width: 45%;"></div>
          </div>
          <p class="progress-text">45% Complete</p>
        </div>
      </div>
    </div>
  `;
}