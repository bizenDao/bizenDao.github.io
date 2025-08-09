import './style.css';
import { router } from './router';
import { header } from './components/Header';
import { HomePage } from './pages/Home';
import { NftPage } from './pages/Nft';
import { MintPage } from './pages/Mint';
import { ShopPage } from './pages/Shop';
import { profilePage } from './pages/Profile';

const app = document.querySelector('#app');

// Navigation items
const navItems = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'nft', label: 'NFT', icon: '🎨' },
  { id: 'mint', label: 'Mint', icon: '✨' },
  { id: 'shop', label: 'Shop', icon: '🛍️' },
  { id: 'profile', label: 'Profile', icon: '👤' }
];

// Create app structure
function createAppStructure() {
  app.innerHTML = `
    <div class="app-container">
      <header id="app-header" class="app-header"></header>
      <div id="page-content" class="page-content"></div>
      <nav class="bottom-nav">
        ${navItems.map(item => `
          <button class="nav-item" data-route="${item.id}">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
          </button>
        `).join('')}
      </nav>
    </div>
  `;
  
  // Initialize header
  header.render();
  header.checkConnection();
  
  // Add click handlers to navigation items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.getAttribute('data-route');
      router.navigate(route);
    });
  });
}

// Update navigation active state
function updateNavigation(route) {
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-route') === route) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Page renderers
function renderPage(content) {
  const pageContent = document.getElementById('page-content');
  if (pageContent) {
    pageContent.innerHTML = content;
  }
}

// Route handlers
router.addRoute('home', () => {
  renderPage(HomePage());
  updateNavigation('home');
});

router.addRoute('nft', () => {
  renderPage(NftPage());
  updateNavigation('nft');
});

router.addRoute('mint', () => {
  renderPage(MintPage());
  updateNavigation('mint');
});

router.addRoute('shop', () => {
  renderPage(ShopPage());
  updateNavigation('shop');
});

router.addRoute('profile', () => {
  profilePage.render();
  profilePage.checkConnection();
  updateNavigation('profile');
});

// Set up route change listener
router.setOnRouteChange((route) => {
  // Clean up profile page if navigating away
  if (route !== 'profile' && window.profilePage) {
    window.profilePage.setState({ message: null });
  }
});

// Initialize app
createAppStructure();
router.init();

// Make router, profilePage and header available globally
window.router = router;
window.profilePage = profilePage;
window.header = header;

// Listen for wallet events
window.addEventListener('walletConnected', (e) => {
  console.log('Wallet connected:', e.detail.account);
  // Profile pageを更新
  if (router.getCurrentRoute() === 'profile' && profilePage) {
    profilePage.checkConnection();
  }
});

window.addEventListener('walletDisconnected', () => {
  console.log('Wallet disconnected');
  // Profile pageを更新
  if (router.getCurrentRoute() === 'profile' && profilePage) {
    profilePage.setState({
      isConnected: false,
      contractInfo: null,
      hasMinted: false,
      profileElement: null
    });
  }
});