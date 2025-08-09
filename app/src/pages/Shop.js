export function ShopPage() {
  return `
    <div class="page shop-page">
      <div class="page-header">
        <h1>BizenDao Shop</h1>
        <p class="page-subtitle">Exclusive merchandise for DAO members</p>
      </div>
      
      <div class="shop-categories">
        <button class="category-tab active">All</button>
        <button class="category-tab">Apparel</button>
        <button class="category-tab">Digital</button>
        <button class="category-tab">Collectibles</button>
      </div>
      
      <div class="shop-grid">
        <div class="shop-item">
          <div class="item-image">
            <div class="placeholder-image">BizenDao Hoodie</div>
          </div>
          <h3>BizenDao Hoodie</h3>
          <p class="item-price">0.05 ETH</p>
          <p class="item-description">Premium quality hoodie with embroidered logo</p>
          <button class="shop-button" disabled>Coming Soon</button>
        </div>
        
        <div class="shop-item">
          <div class="item-image">
            <div class="placeholder-image">Member Badge</div>
          </div>
          <h3>Digital Member Badge</h3>
          <p class="item-price">FREE for Members</p>
          <p class="item-description">Exclusive digital badge for Discord</p>
          <button class="shop-button" disabled>Coming Soon</button>
        </div>
        
        <div class="shop-item">
          <div class="item-image">
            <div class="placeholder-image">Sticker Pack</div>
          </div>
          <h3>BizenDao Sticker Pack</h3>
          <p class="item-price">0.01 ETH</p>
          <p class="item-description">Set of 10 vinyl stickers</p>
          <button class="shop-button" disabled>Coming Soon</button>
        </div>
      </div>
      
      <div class="shop-notice">
        <p>🎉 Shop opens exclusively for BizenDao members in Q2 2024</p>
      </div>
    </div>
  `;
}