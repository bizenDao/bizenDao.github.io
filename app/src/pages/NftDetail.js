import { header } from '../components/Header';
import { nftContract } from '../nftContract';
import { getExplorerUrl, CONTRACT_ADDRESSES, CHAIN_CONFIG } from '../config';
import { tbaManager } from '../tbaManager';
import { walletManager } from '../wallet';

export class NftDetailPage {
  constructor() {
    this.state = {
      isLoading: true,
      nft: null,
      error: null,
      tokenId: null,
      tbaAddress: null,
      tbaExists: false,
      tbaLoading: false,
      tbaNFTs: [],
      isOwner: false,
      tbaAvailable: true
    };
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.render();
  }

  async loadNFTDetail(tokenId) {
    try {
      this.setState({ isLoading: true, error: null, tokenId });

      // Initialize contract
      const initialized = await nftContract.initialize();
      
      if (!initialized) {
        this.setState({
          isLoading: false,
          error: 'ウォレットを接続してNFT詳細を表示してください（ローカル環境ではCORSエラーが発生します）'
        });
        return;
      }

      // Fetch NFT details
      const [tokenURI, owner, isLocked, creator] = await Promise.all([
        nftContract.contract.tokenURI(tokenId),
        nftContract.contract.ownerOf(tokenId),
        nftContract.contract.isLocked(tokenId),
        nftContract.contract.tokenCreator(tokenId)
      ]);

      console.log(`Loading details for NFT #${tokenId}`);
      console.log('Token URI:', tokenURI);

      // Parse metadata
      let metadata = {};
      if (tokenURI) {
        try {
          if (tokenURI.startsWith('data:application/json;base64,')) {
            const base64Data = tokenURI.split(',')[1];
            const jsonString = atob(base64Data);
            metadata = JSON.parse(jsonString);
          } else if (tokenURI.includes('arweave.net')) {
            try {
              const response = await fetch(tokenURI);
              if (response.ok) {
                metadata = await response.json();
              }
            } catch (fetchErr) {
              console.error('Failed to fetch from Arweave:', fetchErr);
              // Try proxy
              try {
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(tokenURI)}`;
                const proxyResponse = await fetch(proxyUrl);
                if (proxyResponse.ok) {
                  metadata = await proxyResponse.json();
                }
              } catch (proxyErr) {
                console.error('Proxy fetch also failed:', proxyErr);
              }
            }
          }
        } catch (err) {
          console.error('Failed to parse metadata:', err);
        }
      }

      const nft = {
        tokenId: tokenId.toString(),
        name: metadata.name || `BizenDao NFT #${tokenId}`,
        description: metadata.description || 'BizenDao NFT',
        image: metadata.image || '/assets/logo.jpg',
        owner,
        creator,
        isLocked,
        tokenURI,
        attributes: metadata.attributes || []
      };

      // Check if current user is the owner
      const { account } = header.getConnectionStatus();
      const isOwner = account && owner.toLowerCase() === account.toLowerCase();

      this.setState({ isLoading: false, nft, isOwner });

      // Load TBA information
      await this.loadTBAInfo(tokenId);
    } catch (error) {
      console.error('Failed to load NFT details:', error);
      this.setState({
        isLoading: false,
        error: 'NFTの詳細を読み込めませんでした'
      });
    }
  }

  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  async loadTBAInfo(tokenId) {
    try {
      const initialized = await tbaManager.initialize();
      
      // If TBA Manager failed to initialize, show TBA as not available
      if (!initialized) {
        console.log('TBA functionality not available');
        this.setState({ 
          tbaAddress: null, 
          tbaExists: false,
          tbaAvailable: false 
        });
        return;
      }
      
      // Get TBA address
      const tbaAddress = await tbaManager.getTBAAddress(CONTRACT_ADDRESSES.BIZENDAO_NFT, tokenId);
      const tbaExists = await tbaManager.isTBACreated(CONTRACT_ADDRESSES.BIZENDAO_NFT, tokenId);
      
      this.setState({ 
        tbaAddress, 
        tbaExists,
        tbaAvailable: true 
      });
      
      // If TBA exists, load NFTs inside it
      if (tbaExists) {
        await this.loadTBANFTs();
      }
    } catch (error) {
      console.error('Failed to load TBA info:', error);
      this.setState({ 
        tbaAddress: null, 
        tbaExists: false,
        tbaAvailable: false 
      });
    }
  }

  async loadTBANFTs() {
    if (!this.state.tbaAddress) return;
    
    try {
      this.setState({ tbaLoading: true });
      const nfts = await tbaManager.getTBANFTs(this.state.tbaAddress);
      this.setState({ tbaNFTs: nfts, tbaLoading: false });
    } catch (error) {
      console.error('Failed to load TBA NFTs:', error);
      this.setState({ tbaLoading: false });
    }
  }

  async createTBA() {
    if (!this.state.isOwner || !walletManager.isConnected()) {
      alert('NFTのオーナーのみがTBAを作成できます');
      return;
    }

    try {
      this.setState({ tbaLoading: true });
      
      // Debug: Check the current chain ID
      const provider = walletManager.ethereum;
      const chainId = await provider.request({ method: 'eth_chainId' });
      console.log('Current chain ID:', chainId, 'Expected:', CHAIN_CONFIG.chainId);
      
      if (chainId !== CHAIN_CONFIG.chainId) {
        alert(`Wrong network! Please switch to ${CHAIN_CONFIG.chainName}`);
        this.setState({ tbaLoading: false });
        return;
      }
      
      const tbaAddress = await tbaManager.createTBA(
        CONTRACT_ADDRESSES.BIZENDAO_NFT,
        parseInt(this.state.tokenId) // Ensure tokenId is a number
      );
      
      this.setState({ 
        tbaAddress, 
        tbaExists: true,
        tbaLoading: false 
      });
      
      // Reload TBA NFTs
      await this.loadTBANFTs();
    } catch (error) {
      console.error('Failed to create TBA:', error);
      alert('TBAの作成に失敗しました: ' + error.message);
      this.setState({ tbaLoading: false });
    }
  }

  render() {
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;

    const { isConnected } = header.getConnectionStatus();

    pageContent.innerHTML = `
      <div class="page nft-detail-page">
        ${this.state.isLoading ? `
          <div class="loading-container">
            <span class="loading"></span>
            <p>NFT詳細を読み込み中...</p>
          </div>
        ` : this.state.error ? `
          <div class="error-container">
            <div class="message error">
              ${this.state.error}
            </div>
            <button onclick="window.router.navigate('nft')" class="back-button">
              ← NFT一覧に戻る
            </button>
          </div>
        ` : this.state.nft ? `
          <div class="nft-detail-container">
            <button onclick="window.router.navigate('nft')" class="back-button">
              ← NFT一覧に戻る
            </button>
            
            <div class="nft-detail-content">
              <div class="nft-detail-image">
                <img src="${this.state.nft.image}" alt="${this.state.nft.name}" onerror="this.src='./assets/logo.jpg'">
                ${this.state.nft.isLocked ? '<span class="nft-badge locked">SBT</span>' : ''}
              </div>
              
              <div class="nft-detail-info">
                <h1>${this.state.nft.name}</h1>
                <p class="nft-detail-description">${this.state.nft.description}</p>
                
                <div class="nft-detail-section">
                  <h3>詳細情報</h3>
                  <div class="detail-grid">
                    <div class="detail-row">
                      <span class="detail-label">トークンID</span>
                      <span class="detail-value">#${this.state.nft.tokenId}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">オーナー</span>
                      <span class="detail-value">
                        ${getExplorerUrl(this.state.nft.owner, 'address') ? 
                          `<a href="${getExplorerUrl(this.state.nft.owner, 'address')}" target="_blank" class="address-link">
                            ${this.formatAddress(this.state.nft.owner)}
                          </a>` : 
                          this.formatAddress(this.state.nft.owner)
                        }
                      </span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">作成者</span>
                      <span class="detail-value">
                        ${getExplorerUrl(this.state.nft.creator, 'address') ? 
                          `<a href="${getExplorerUrl(this.state.nft.creator, 'address')}" target="_blank" class="address-link">
                            ${this.formatAddress(this.state.nft.creator)}
                          </a>` : 
                          this.formatAddress(this.state.nft.creator)
                        }
                      </span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">タイプ</span>
                      <span class="detail-value">${this.state.nft.isLocked ? 'Soul Bound Token (譲渡不可)' : 'ERC721 (譲渡可能)'}</span>
                    </div>
                  </div>
                </div>
                
                ${this.state.nft.attributes && this.state.nft.attributes.length > 0 ? `
                  <div class="nft-detail-section">
                    <h3>属性</h3>
                    <div class="attributes-grid">
                      ${this.state.nft.attributes.map(attr => `
                        <div class="attribute-card">
                          <div class="attribute-type">${attr.trait_type || 'Property'}</div>
                          <div class="attribute-value">${attr.value}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
                
                <div class="nft-detail-section">
                  <h3>メタデータ</h3>
                  <div class="metadata-info">
                    <p class="metadata-uri">
                      ${this.state.nft.tokenURI.startsWith('http') ? 
                        `<a href="${this.state.nft.tokenURI}" target="_blank" class="metadata-link">
                          ${this.state.nft.tokenURI}
                        </a>` : 
                        `<span class="metadata-text">${this.state.nft.tokenURI.slice(0, 50)}...</span>`
                      }
                    </p>
                  </div>
                </div>

                <div class="nft-detail-section tba-section">
                  <h3>Token Bound Account (TBA)</h3>
                  ${!this.state.tbaAvailable ? `
                    <div class="tba-unavailable">
                      <p class="info-text">TBA機能は現在利用できません（コントラクトがデプロイされていません）</p>
                    </div>
                  ` : this.state.tbaExists ? `
                    <div class="tba-info">
                      <div class="detail-row">
                        <span class="detail-label">TBAアドレス</span>
                        <span class="detail-value">
                          ${getExplorerUrl(this.state.tbaAddress, 'address') ? 
                            `<a href="${getExplorerUrl(this.state.tbaAddress, 'address')}" target="_blank" class="address-link">
                              ${this.formatAddress(this.state.tbaAddress)}
                            </a>` : 
                            this.formatAddress(this.state.tbaAddress)
                          }
                        </span>
                      </div>
                      
                      <div class="tba-nfts">
                        <h4>TBA内のNFT (${this.state.tbaNFTs.length}個)</h4>
                        ${this.state.tbaLoading ? `
                          <div class="loading-container">
                            <span class="loading"></span>
                          </div>
                        ` : this.state.tbaNFTs.length > 0 ? `
                          <div class="tba-nft-grid">
                            ${this.state.tbaNFTs.map(nft => `
                              <div class="tba-nft-card" onclick="window.router.navigate('nft/${nft.tokenId}')" style="cursor: pointer;">
                                <img src="${nft.image}" alt="${nft.name}" onerror="this.src='./assets/logo.jpg'">
                                <h5>${nft.name}</h5>
                                <p class="tba-nft-id">#${nft.tokenId}</p>
                                ${nft.isLocked ? '<span class="nft-badge locked">SBT</span>' : ''}
                              </div>
                            `).join('')}
                          </div>
                        ` : `
                          <p class="no-nfts">TBA内にNFTがありません</p>
                        `}
                      </div>
                    </div>
                  ` : `
                    <div class="tba-create">
                      <p>このNFTのTBAはまだ作成されていません</p>
                      ${this.state.isOwner && isConnected ? `
                        <button 
                          onclick="window.nftDetailPage.createTBA()" 
                          class="create-tba-button"
                          ${this.state.tbaLoading ? 'disabled' : ''}
                        >
                          ${this.state.tbaLoading ? '<span class="loading"></span>作成中...' : 'TBAを作成'}
                        </button>
                      ` : this.state.isOwner && !isConnected ? `
                        <p class="info-text">TBAを作成するにはウォレットを接続してください</p>
                      ` : `
                        <p class="info-text">NFTのオーナーのみがTBAを作成できます</p>
                      `}
                    </div>
                  `}
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

export const nftDetailPage = new NftDetailPage();