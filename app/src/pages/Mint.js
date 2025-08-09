import { header } from '../components/Header';
import { walletManager } from '../wallet';
import { ethers } from 'ethers';
import { CHAIN_CONFIG, CONTRACT_ADDRESSES } from '../config';
import BizenDaoNFT_ABI from '../BizenDaoNFT_ABI';

export class MintPage {
  constructor() {
    this.state = {
      isConnected: false,
      isLoading: false,
      message: null,
      mintFee: '0',
      formData: {
        toAddress: '',
        tokenURI: '',
        isLocked: false
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

  async checkConnection() {
    const { isConnected, account } = header.getConnectionStatus();
    this.setState({ isConnected });
    
    if (isConnected) {
      // デフォルトで自分のアドレスを入力
      this.setState({
        formData: {
          ...this.state.formData,
          toAddress: account
        }
      });
      await this.loadMintFee();
    }
  }

  async loadMintFee() {
    try {
      const provider = new ethers.BrowserProvider(walletManager.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.BIZENDAO_NFT,
        BizenDaoNFT_ABI,
        provider
      );
      
      const fee = await contract.mintFee();
      this.setState({ mintFee: ethers.formatEther(fee) });
    } catch (error) {
      console.error('Failed to load mint fee:', error);
    }
  }

  updateFormData(field, value) {
    this.setState({
      formData: {
        ...this.state.formData,
        [field]: value
      }
    });
  }

  validateForm() {
    const { toAddress, tokenURI } = this.state.formData;
    
    if (!toAddress) {
      this.showMessage('ミント先アドレスを入力してください', 'error');
      return false;
    }
    
    if (!ethers.isAddress(toAddress)) {
      this.showMessage('有効なアドレスを入力してください', 'error');
      return false;
    }
    
    if (!tokenURI) {
      this.showMessage('Token URIを入力してください', 'error');
      return false;
    }
    
    return true;
  }

  async mintNFT() {
    if (!this.validateForm()) return;
    
    this.setState({ isLoading: true, message: null });
    
    try {
      const provider = new ethers.BrowserProvider(walletManager.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.BIZENDAO_NFT,
        BizenDaoNFT_ABI,
        signer
      );
      
      const { toAddress, tokenURI, isLocked } = this.state.formData;
      const mintFee = await contract.mintFee();
      
      this.showMessage('トランザクションを送信中...', 'info');
      
      const tx = await contract.mint(toAddress, tokenURI, isLocked, {
        value: mintFee
      });
      
      this.showMessage('トランザクションを処理中...', 'info');
      const receipt = await tx.wait();
      
      // TokenMintedイベントからtokenIdを取得
      const event = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(e => e && e.name === 'TokenMinted');
      
      const tokenId = event ? event.args.tokenId.toString() : 'unknown';
      
      this.showMessage(
        `NFTのミントに成功しました！Token ID: #${tokenId}`,
        'success'
      );
      
      // フォームをリセット
      this.setState({
        formData: {
          toAddress: walletManager.account || '',
          tokenURI: '',
          isLocked: false
        }
      });
      
    } catch (error) {
      console.error('Minting error:', error);
      
      let errorMessage = 'ミントに失敗しました';
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'ガス代とミント費用が不足しています';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'トランザクションがキャンセルされました';
      }
      
      this.showMessage(errorMessage, 'error');
    } finally {
      this.setState({ isLoading: false });
    }
  }

  render() {
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;

    pageContent.innerHTML = `
      <div class="page mint-page">
        <div class="page-header">
          <h1>Mint BizenDao NFT</h1>
          <p class="page-subtitle">BizenDao NFTをミントする</p>
        </div>

        ${this.state.message ? `
          <div class="message ${this.state.message.type}">
            ${this.state.message.text}
          </div>
        ` : ''}

        ${!this.state.isConnected ? `
          <div class="wallet-notice">
            <p>NFTをミントするにはウォレットを接続してください</p>
          </div>
        ` : `
          <div class="mint-form-container">
            <div class="mint-info-box">
              <h3>ミント情報</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">コントラクト</span>
                  <span class="info-value">${CONTRACT_ADDRESSES.BIZENDAO_NFT.slice(0, 6)}...${CONTRACT_ADDRESSES.BIZENDAO_NFT.slice(-4)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">ミント費用</span>
                  <span class="info-value">${this.state.mintFee} ${CHAIN_CONFIG.nativeCurrency.symbol}</span>
                </div>
              </div>
            </div>

            <div class="mint-form">
              <h3>NFT情報入力</h3>
              
              <div class="form-group">
                <label for="toAddress">ミント先アドレス</label>
                <input
                  type="text"
                  id="toAddress"
                  placeholder="0x..."
                  value="${this.state.formData.toAddress}"
                  onchange="window.mintPage.updateFormData('toAddress', this.value)"
                  ${this.state.isLoading ? 'disabled' : ''}
                />
                <p class="form-hint">NFTを受け取るウォレットアドレス</p>
              </div>

              <div class="form-group">
                <label for="tokenURI">Token URI</label>
                <input
                  type="text"
                  id="tokenURI"
                  placeholder="https://... または ipfs://... または data:application/json..."
                  value="${this.state.formData.tokenURI}"
                  onchange="window.mintPage.updateFormData('tokenURI', this.value)"
                  ${this.state.isLoading ? 'disabled' : ''}
                />
                <p class="form-hint">NFTのメタデータURI（JSON形式）</p>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    id="isLocked"
                    ${this.state.formData.isLocked ? 'checked' : ''}
                    onchange="window.mintPage.updateFormData('isLocked', this.checked)"
                    ${this.state.isLoading ? 'disabled' : ''}
                  />
                  <span>Soul Bound Token（譲渡不可）にする</span>
                </label>
                <p class="form-hint">チェックするとこのNFTは譲渡できなくなります</p>
              </div>

              <button
                onclick="window.mintPage.mintNFT()"
                ${this.state.isLoading ? 'disabled' : ''}
                class="mint-button"
              >
                ${this.state.isLoading ? '<span class="loading"></span>ミント中...' : 'NFTをミント'}
              </button>
            </div>

            <div class="token-uri-example">
              <h4>Token URI の例</h4>
              <pre>{
  "name": "BizenDao NFT #1",
  "description": "BizenDao community NFT",
  "image": "https://example.com/image.png",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Community"
    }
  ]
}</pre>
              <p class="form-hint">
                Token URIには上記のようなJSON形式のメタデータURLを指定します。
                Arweave、IPFS、または data: URL形式もサポートしています。
              </p>
            </div>
          </div>
        `}
      </div>
    `;
  }
}

export const mintPage = new MintPage();