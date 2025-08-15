import { ethers } from 'ethers';
import { CHAIN_CONFIG } from './config';

class WalletManager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.ethereum = null;
  }

  async connect() {
    try {
      // MetaMaskが利用可能かチェック
      if (!window.ethereum) {
        throw new Error('MetaMaskがインストールされていません。');
      }

      this.ethereum = window.ethereum;
      
      // アカウントをリクエスト
      const accounts = await this.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.provider = new ethers.BrowserProvider(this.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = accounts[0];

      // チェーンの切り替え
      await this.switchToCorrectChain();

      // イベントリスナーの設定
      this.setupEventListeners();

      return this.account;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.ethereum) return;

    // アカウント変更の監視
    this.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.account = accounts[0];
        window.location.reload();
      }
    });

    // チェーン変更の監視
    this.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }

  async switchToCorrectChain() {
    try {
      const chainId = await this.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== CHAIN_CONFIG.chainId) {
        try {
          await this.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHAIN_CONFIG.chainId }],
          });
        } catch (switchError) {
          // チェーンが追加されていない場合
          if (switchError.code === 4902) {
            await this.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [CHAIN_CONFIG],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error('Error switching chain:', error);
      throw error;
    }
  }

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.ethereum = null;
  }

  getAccount() {
    return this.account;
  }

  getSigner() {
    return this.signer;
  }

  getProvider() {
    return this.provider;
  }

  isConnected() {
    return this.account !== null;
  }

  formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
}

export const walletManager = new WalletManager();