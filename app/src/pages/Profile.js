import { header } from '../components/Header';
import { nftMinter } from '../mint';
import { CHAIN_CONFIG, getExplorerUrl, getCurrencySymbol, isDevelopment, FORCE_PRIVATE_CHAIN } from '../config';
import { userProfileManager } from '../userProfile';
import { DEFAULT_AVATAR, processImageToBase64, validateImageFile, getBase64SizeKB } from '../imageUtils';

export class ProfilePage {
  constructor() {
    this.state = {
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
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.render();
  }

  showMessage(text, type = 'info') {
    this.setState({ message: { text, type } });
    if (type !== 'error') {
      setTimeout(() => this.setState({ message: null }), 5000);
    }
  }

  async updateConnectionStatus() {
    const { isConnected, account } = header.getConnectionStatus();
    
    this.setState({ isConnected });
    
    if (isConnected) {
      await this.loadContractInfo();
    }
  }

  async loadContractInfo() {
    try {
      const { account } = header.getConnectionStatus();
      if (!account) return;
      
      await nftMinter.initialize();
      const contractInfo = await nftMinter.fetchContractData();
      
      const hasMinted = await nftMinter.contract.hasMinted(account);
      
      let profileElement = null;
      if (hasMinted && !this.state.profileElement) {
        await userProfileManager.initialize();
        profileElement = userProfileManager.createProfileUI();
        
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
      
      this.setState({ contractInfo, hasMinted, profileElement });
    } catch (error) {
      console.error('Failed to load contract info:', error);
      this.showMessage('Failed to load NFT contract information', 'error');
    }
  }


  async mintNFT() {
    if (!this.state.mintFormData.memberName.trim()) {
      this.showMessage('Please enter your member name', 'error');
      return;
    }
    
    this.setState({ isLoading: true, message: null });
    
    try {
      this.showMessage('Transaction pending...', 'info');
      
      const result = await nftMinter.mint(1);
      
      this.showMessage('Membership card minted! Setting up your profile...', 'info');
      
      await userProfileManager.initialize();
      
      await userProfileManager.setUserInfo({
        memberName: this.state.mintFormData.memberName.trim(),
        discordId: this.state.mintFormData.discordId.trim() || '',
        avatarImage: this.state.mintFormData.avatarImage || ''
      });
      
      this.setState({ isLoading: false });
      
      const explorerUrl = getExplorerUrl(result.transactionHash);
      const successMessage = explorerUrl 
        ? `Membership card minted and profile set! <a href="${explorerUrl}" target="_blank" class="transaction-link">View transaction</a>`
        : `Membership card minted and profile set! Transaction: ${result.transactionHash}`;
      this.showMessage(successMessage, 'success');
      
      this.setState({
        mintFormData: {
          memberName: '',
          discordId: '',
          avatarImage: null,
          avatarPreview: null
        }
      });
      
      await this.loadContractInfo();
    } catch (error) {
      console.error('Minting error:', error);
      this.setState({ isLoading: false });
      
      let errorMessage = 'Failed to mint membership card';
      if (error.message.includes('already minted')) {
        errorMessage = 'You have already minted your membership card';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction cancelled by user';
      }
      
      this.showMessage(errorMessage, 'error');
    }
  }

  async handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const validation = validateImageFile(file, {
        maxSizeMB: 1,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      });
      
      if (!validation.valid) {
        this.showMessage(validation.error, 'error');
        return;
      }
      
      const base64Image = await processImageToBase64(file, {
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.7
      });
      
      const sizeKB = getBase64SizeKB(base64Image);
      if (sizeKB > 100) {
        this.showMessage(`Image too large (${sizeKB}KB). Maximum: 100KB`, 'error');
        return;
      }
      
      this.setState({
        mintFormData: {
          ...this.state.mintFormData,
          avatarImage: base64Image,
          avatarPreview: base64Image
        }
      });
    } catch (error) {
      this.showMessage('Failed to process image', 'error');
    }
  }

  updateMintForm(field, value) {
    this.setState({
      mintFormData: {
        ...this.state.mintFormData,
        [field]: value
      }
    });
  }

  removeAvatar() {
    this.setState({
      mintFormData: {
        ...this.state.mintFormData,
        avatarImage: null,
        avatarPreview: null
      }
    });
    
    const fileInput = document.getElementById('mintAvatarInput');
    if (fileInput) fileInput.value = '';
  }

  async checkConnection() {
    await this.updateConnectionStatus();
  }

  render() {
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;


    pageContent.innerHTML = `
      <div class="page profile-page">
        <div class="page-header">
          <h1>Member Profile</h1>
          <p class="page-subtitle">Manage your BizenDao membership</p>
        </div>

        ${this.state.message ? `
          <div class="message ${this.state.message.type}">
            ${this.state.message.text}
          </div>
        ` : ''}

        ${!this.state.isConnected ? `
          <div class="wallet-notice">
            <p>Please connect your wallet using the button in the header to access your profile.</p>
          </div>
        ` : ''}

        ${this.state.isConnected ? `
          ${!this.state.hasMinted ? `
            <div class="mint-section">
              ${this.state.contractInfo ? `
                <div class="contract-info">
                  <div class="info-item">
                    <div class="info-label">Price</div>
                    <div class="info-value">FREE</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Minted</div>
                    <div class="info-value">${this.state.contractInfo.totalSupply}</div>
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
                        value="${this.state.mintFormData.memberName}"
                        onchange="window.profilePage.updateMintForm('memberName', this.value)"
                        ${this.state.isLoading ? 'disabled' : ''}
                      />
                    </div>
                    
                    <div class="form-group">
                      <label for="mintDiscordId">Discord ID (Optional)</label>
                      <input 
                        type="text" 
                        id="mintDiscordId" 
                        placeholder="username#1234" 
                        maxlength="50"
                        value="${this.state.mintFormData.discordId}"
                        onchange="window.profilePage.updateMintForm('discordId', this.value)"
                        ${this.state.isLoading ? 'disabled' : ''}
                      />
                    </div>
                    
                    <div class="form-group">
                      <label>Avatar Image (Optional)</label>
                      <div class="avatar-upload-section">
                        ${this.state.mintFormData.avatarPreview ? `
                          <div class="avatar-preview-mint">
                            <img src="${this.state.mintFormData.avatarPreview}" alt="Avatar preview" />
                            <button class="remove-avatar" onclick="window.profilePage.removeAvatar()" ${this.state.isLoading ? 'disabled' : ''}>×</button>
                          </div>
                        ` : `
                          <div class="avatar-placeholder">
                            <img src="${DEFAULT_AVATAR}" alt="Default avatar" />
                          </div>
                        `}
                        <div class="avatar-upload-controls">
                          <input type="file" id="mintAvatarInput" accept="image/*" style="display: none;" onchange="window.profilePage.handleAvatarUpload(event)" />
                          <button class="secondary small" onclick="document.getElementById('mintAvatarInput').click()" ${this.state.isLoading ? 'disabled' : ''}>
                            ${this.state.mintFormData.avatarPreview ? 'Change Avatar' : 'Choose Avatar'}
                          </button>
                          <p class="avatar-info">Max 200x200px, 100KB</p>
                        </div>
                      </div>
                    </div>

                    <button onclick="window.profilePage.mintNFT()" ${this.state.isLoading ? 'disabled' : ''} class="mint-button">
                      ${this.state.isLoading ? '<span class="loading"></span>Minting...' : 'Mint Membership Card'}
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
      </div>
    `;
    
    // Insert profile element if it exists
    if (this.state.profileElement && this.state.hasMinted) {
      const container = document.getElementById('profileContainer');
      if (container) {
        container.appendChild(this.state.profileElement);
      }
    }
  }
}

export const profilePage = new ProfilePage();