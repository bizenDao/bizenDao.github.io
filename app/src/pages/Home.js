export function HomePage() {
  return `
    <div class="page home-page">
      <div class="hero-section">
        <h1>Welcome to BizenDao</h1>
        <p class="hero-subtitle">Decentralized Community for Digital Innovation</p>
        
        <div class="hero-image">
          <img src="/assets/logo.jpg" alt="BizenDao Logo" style="max-width: 200px; border-radius: 50%;">
        </div>
        
        <div class="hero-content">
          <h2>About BizenDao</h2>
          <p>BizenDao is a decentralized autonomous organization focused on building the future of digital communities through blockchain technology.</p>
          
          <div class="features">
            <div class="feature-card">
              <h3>🎫 Membership NFT</h3>
              <p>Join our community by minting your exclusive membership card</p>
            </div>
            
            <div class="feature-card">
              <h3>🛍️ DAO Shop</h3>
              <p>Exclusive merchandise and digital goods for members</p>
            </div>
            
            <div class="feature-card">
              <h3>👤 Member Profile</h3>
              <p>Customize your profile and connect with other members</p>
            </div>
          </div>
          
          <div class="cta-section">
            <button onclick="window.router.navigate('nft')" class="cta-button">
              Get Started →
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}