import { header } from '../components/Header';
import { nftContract } from '../nftContract';
import { getExplorerUrl } from '../config';

export class NftDetailPage {
  constructor() {
    this.state = {
      isLoading: true,
      nft: null,
      error: null,
      tokenId: null
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

      this.setState({ isLoading: false, nft });
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
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

export const nftDetailPage = new NftDetailPage();