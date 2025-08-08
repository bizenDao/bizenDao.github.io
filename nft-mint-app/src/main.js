import './style.css';
import { walletManager } from './wallet';
import { nftMinter } from './mint';
import { CHAIN_CONFIG, getExplorerUrl, getCurrencySymbol, isDevelopment } from './config';

const app = document.querySelector('#app');

let state = {
  isConnected: false,
  isLoading: false,
  mintQuantity: 1,
  message: null,
  contractInfo: null
};

function setState(updates) {
  state = { ...state, ...updates };
  render();
}

function showMessage(text, type = 'info') {
  setState({ message: { text, type } });
  if (type !== 'error') {
    setTimeout(() => setState({ message: null }), 5000);
  }
}

async function connectWallet() {
  setState({ isLoading: true, message: null });
  
  try {
    const account = await walletManager.connect();
    
    setState({
      isConnected: true,
      isLoading: false
    });
    
    showMessage('Wallet connected successfully!', 'success');
    
    // コントラクト情報を非同期で取得
    loadContractInfo();
  } catch (error) {
    console.error('Connection error:', error);
    setState({ isLoading: false });
    showMessage(error.message || 'Failed to connect wallet', 'error');
  }
}

async function loadContractInfo() {
  try {
    await nftMinter.initialize();
    const contractInfo = await nftMinter.fetchContractData();
    setState({ contractInfo });
  } catch (error) {
    console.error('Failed to load contract info:', error);
    showMessage('Failed to load NFT contract information', 'error');
  }
}

async function disconnectWallet() {
  walletManager.disconnect();
  setState({
    isConnected: false,
    contractInfo: null,
    message: null
  });
}

async function mintNFT() {
  setState({ isLoading: true, message: null });
  
  try {
    showMessage('Transaction pending...', 'info');
    
    const result = await nftMinter.mint(state.mintQuantity);
    
    setState({ isLoading: false, mintQuantity: 1 });
    
    const explorerUrl = getExplorerUrl(result.transactionHash);
    const successMessage = explorerUrl 
      ? `NFT minted successfully! <a href="${explorerUrl}" target="_blank" class="transaction-link">View transaction</a>`
      : `NFT minted successfully! Transaction: ${result.transactionHash}`;
    showMessage(successMessage, 'success');
    
    // Refresh contract data
    const contractInfo = await nftMinter.fetchContractData();
    setState({ contractInfo });
  } catch (error) {
    console.error('Minting error:', error);
    setState({ isLoading: false });
    
    let errorMessage = 'Failed to mint NFT';
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds for transaction';
    } else if (error.message.includes('user rejected')) {
      errorMessage = 'Transaction cancelled by user';
    }
    
    showMessage(errorMessage, 'error');
  }
}

function updateQuantity(delta) {
  const newQuantity = Math.max(1, Math.min(10, state.mintQuantity + delta));
  setState({ mintQuantity: newQuantity });
}

function render() {
  app.innerHTML = `
    <div class="header">
      <h1>NFT Mint App</h1>
      <p class="subtitle">Mint your NFT directly from mobile browser</p>
      ${isDevelopment ? '<p class="dev-notice">🛠️ Development Mode - Private Chain</p>' : ''}
    </div>

    ${state.message ? `
      <div class="message ${state.message.type}">
        ${state.message.text}
      </div>
    ` : ''}

    <div class="wallet-section">
      ${state.isConnected ? `
        <div class="wallet-info">
          <span class="wallet-address">${walletManager.formatAddress(walletManager.getAccount())}</span>
        </div>
        <button class="secondary" onclick="window.app.disconnectWallet()" ${state.isLoading ? 'disabled' : ''}>
          Disconnect
        </button>
      ` : `
        <button onclick="window.app.connectWallet()" ${state.isLoading ? 'disabled' : ''}>
          ${state.isLoading ? '<span class="loading"></span>Connecting...' : 'Connect Wallet'}
        </button>
      `}
    </div>

    ${state.isConnected ? `
      <div class="mint-section">
        ${state.contractInfo ? `
          <div class="contract-info">
            <div class="info-item">
              <div class="info-label">Price</div>
              <div class="info-value">${state.contractInfo.mintPrice} ${getCurrencySymbol()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Minted</div>
              <div class="info-value">${state.contractInfo.totalSupply}/${state.contractInfo.maxSupply}</div>
            </div>
          </div>

          <div class="mint-controls">
            <div class="quantity-selector">
              <button class="quantity-button secondary" onclick="window.app.updateQuantity(-1)">-</button>
              <span class="quantity">${state.mintQuantity}</span>
              <button class="quantity-button secondary" onclick="window.app.updateQuantity(1)">+</button>
            </div>
            
            <div class="total-price">
              Total: ${(parseFloat(state.contractInfo.mintPrice) * state.mintQuantity).toFixed(4)} ${getCurrencySymbol()}
            </div>

            <button onclick="window.app.mintNFT()" ${state.isLoading ? 'disabled' : ''}>
              ${state.isLoading ? '<span class="loading"></span>Minting...' : 'Mint NFT'}
            </button>
          </div>
        ` : `
          <div class="loading-contract">
            <span class="loading"></span>
            <p>Loading contract information...</p>
          </div>
        `}
      </div>
    ` : ''}
  `;
}

// Make functions available globally for onclick handlers
window.app = {
  connectWallet,
  disconnectWallet,
  mintNFT,
  updateQuantity
};

// Initial render
render();

// Check if already connected on load
if (typeof window.ethereum !== 'undefined') {
  window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
    if (accounts.length > 0) {
      connectWallet();
    }
  });
}