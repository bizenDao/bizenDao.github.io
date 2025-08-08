import './style.css';
import { walletManager } from './wallet';
import { nftMinter } from './mint';
import { CHAIN_CONFIG, getExplorerUrl, getCurrencySymbol, isDevelopment, FORCE_PRIVATE_CHAIN } from './config';
import { userProfileManager } from './userProfile';
import { DEFAULT_AVATAR, processImageToBase64, validateImageFile, getBase64SizeKB } from './imageUtils';

const app = document.querySelector('#app');

let state = {
  isConnected: false,
  isLoading: false,
  mintQuantity: 1,
  message: null,
  contractInfo: null,
  hasMinted: false,
  profileElement: null,
  mintFormData: {
    memberName: '',
    discordId: '',
    avatarImage: null,
    avatarPreview: null
  }
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
    
    // Check if user has already minted
    const account = walletManager.getAccount();
    const hasMinted = await nftMinter.contract.hasMinted(account);
    
    // Create profile UI if user has minted
    let profileElement = null;
    if (hasMinted && !state.profileElement) {
      await userProfileManager.initialize();
      profileElement = userProfileManager.createProfileUI();
      
      // Try to load existing profile data
      try {
        await userProfileManager.getUserInfo();
        const info = userProfileManager.currentUserInfo;
        if (info) {
          profileElement.querySelector('#memberName').value = info.memberName || '';
          profileElement.querySelector('#discordId').value = info.discordId || '';
          if (info.avatarImage && info.avatarImage !== DEFAULT_AVATAR) {
            profileElement.querySelector('#avatarPreview img').src = info.avatarImage;
            profileElement.querySelector('#removeButton').style.display = 'inline-block';
          }
        }
      } catch (err) {
        console.log('No existing profile data');
      }
    }
    
    setState({ contractInfo, hasMinted, profileElement });
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
    message: null,
    hasMinted: false,
    profileElement: null
  });
}

async function mintNFT() {
  // Validate form
  if (!state.mintFormData.memberName.trim()) {
    showMessage('Please enter your member name', 'error');
    return;
  }
  
  setState({ isLoading: true, message: null });
  
  try {
    showMessage('Transaction pending...', 'info');
    
    const result = await nftMinter.mint(1); // SBT is always 1 per address
    
    // Wait for transaction to be mined
    showMessage('Membership card minted! Setting up your profile...', 'info');
    
    // Initialize user profile manager if not already done
    await userProfileManager.initialize();
    
    // Set user info
    await userProfileManager.setUserInfo({
      memberName: state.mintFormData.memberName.trim(),
      discordId: state.mintFormData.discordId.trim() || '',
      avatarImage: state.mintFormData.avatarImage || ''
    });
    
    setState({ isLoading: false });
    
    const explorerUrl = getExplorerUrl(result.transactionHash);
    const successMessage = explorerUrl 
      ? `Membership card minted and profile set! <a href="${explorerUrl}" target="_blank" class="transaction-link">View transaction</a>`
      : `Membership card minted and profile set! Transaction: ${result.transactionHash}`;
    showMessage(successMessage, 'success');
    
    // Clear form data
    setState({
      mintFormData: {
        memberName: '',
        discordId: '',
        avatarImage: null,
        avatarPreview: null
      }
    });
    
    // Refresh contract data and load profile UI
    await loadContractInfo();
  } catch (error) {
    console.error('Minting error:', error);
    setState({ isLoading: false });
    
    let errorMessage = 'Failed to mint membership card';
    if (error.message.includes('already minted')) {
      errorMessage = 'You have already minted your membership card';
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds for gas fees';
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
      <h1>BizenDao Members Card</h1>
      <p class="subtitle">Mint your membership SBT directly from mobile browser</p>
      ${(isDevelopment || FORCE_PRIVATE_CHAIN) ? '<p class="dev-notice">🛠️ Development Mode - Private Chain</p>' : ''}
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
      ${!state.hasMinted ? `
        <div class="mint-section">
          ${state.contractInfo ? `
            <div class="contract-info">
              <div class="info-item">
                <div class="info-label">Price</div>
                <div class="info-value">FREE</div>
              </div>
              <div class="info-item">
                <div class="info-label">Minted</div>
                <div class="info-value">${state.contractInfo.totalSupply}</div>
              </div>
            </div>

            <div class="mint-controls">
              <div class="sbt-info">
                <p class="sbt-notice">🎫 One membership card per wallet</p>
                <p class="sbt-notice">💎 Soul Bound Token (Non-transferable)</p>
                <p class="sbt-notice">🆓 Free mint (gas only)</p>
              </div>

              <div class="mint-form">
                <h3>Member Information</h3>
                
                <div class="form-group">
                  <label for="mintMemberName">Member Name *</label>
                  <input 
                    type="text" 
                    id="mintMemberName" 
                    placeholder="Enter your name" 
                    maxlength="50"
                    value="${state.mintFormData.memberName}"
                    onchange="window.app.updateMintForm('memberName', this.value)"
                    ${state.isLoading ? 'disabled' : ''}
                  />
                </div>
                
                <div class="form-group">
                  <label for="mintDiscordId">Discord ID (Optional)</label>
                  <input 
                    type="text" 
                    id="mintDiscordId" 
                    placeholder="username#1234" 
                    maxlength="50"
                    value="${state.mintFormData.discordId}"
                    onchange="window.app.updateMintForm('discordId', this.value)"
                    ${state.isLoading ? 'disabled' : ''}
                  />
                </div>
                
                <div class="form-group">
                  <label>Avatar Image (Optional)</label>
                  <div class="avatar-upload-section">
                    ${state.mintFormData.avatarPreview ? `
                      <div class="avatar-preview-mint">
                        <img src="${state.mintFormData.avatarPreview}" alt="Avatar preview" />
                        <button class="remove-avatar" onclick="window.app.removeAvatar()" ${state.isLoading ? 'disabled' : ''}>×</button>
                      </div>
                    ` : `
                      <div class="avatar-placeholder">
                        <img src="${DEFAULT_AVATAR}" alt="Default avatar" />
                      </div>
                    `}
                    <div class="avatar-upload-controls">
                      <input type="file" id="mintAvatarInput" accept="image/*" style="display: none;" onchange="window.app.handleAvatarUpload(event)" />
                      <button class="secondary small" onclick="document.getElementById('mintAvatarInput').click()" ${state.isLoading ? 'disabled' : ''}>
                        ${state.mintFormData.avatarPreview ? 'Change Avatar' : 'Choose Avatar'}
                      </button>
                      <p class="avatar-info">Max 200x200px, 100KB</p>
                    </div>
                  </div>
                </div>

                <button onclick="window.app.mintNFT()" ${state.isLoading ? 'disabled' : ''} class="mint-button">
                  ${state.isLoading ? '<span class="loading"></span>Minting...' : 'Mint Membership Card'}
                </button>
              </div>
            </div>
          ` : `
            <div class="loading-contract">
              <span class="loading"></span>
              <p>Loading contract information...</p>
            </div>
          `}
        </div>
      ` : ''}
      
      <div id="profileContainer"></div>
    ` : ''}
  `;
  
  // Insert profile element if it exists
  if (state.profileElement && state.hasMinted) {
    const container = document.getElementById('profileContainer');
    if (container) {
      container.appendChild(state.profileElement);
    }
  }
}

// Form handling functions
async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const validation = validateImageFile(file, {
      maxSizeMB: 1,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    });
    
    if (!validation.valid) {
      showMessage(validation.error, 'error');
      return;
    }
    
    const base64Image = await processImageToBase64(file, {
      maxWidth: 200,
      maxHeight: 200,
      quality: 0.7
    });
    
    // Check size
    const sizeKB = getBase64SizeKB(base64Image);
    if (sizeKB > 100) {
      showMessage(`Image too large (${sizeKB}KB). Maximum: 100KB`, 'error');
      return;
    }
    
    setState({
      mintFormData: {
        ...state.mintFormData,
        avatarImage: base64Image,
        avatarPreview: base64Image
      }
    });
  } catch (error) {
    showMessage('Failed to process image', 'error');
  }
}

function updateMintForm(field, value) {
  setState({
    mintFormData: {
      ...state.mintFormData,
      [field]: value
    }
  });
}

function removeAvatar() {
  setState({
    mintFormData: {
      ...state.mintFormData,
      avatarImage: null,
      avatarPreview: null
    }
  });
  
  // Reset file input
  const fileInput = document.getElementById('mintAvatarInput');
  if (fileInput) fileInput.value = '';
}

// Make functions available globally for onclick handlers
window.app = {
  connectWallet,
  disconnectWallet,
  mintNFT,
  updateQuantity,
  handleAvatarUpload,
  updateMintForm,
  removeAvatar
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