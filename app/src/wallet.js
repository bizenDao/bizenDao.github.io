import { ethers } from 'ethers';
import { CHAIN_CONFIG } from './config';

class WalletManager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.ethereum = null;
    this.sdk = null;
    this.isInitializing = false;
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.isMetaMaskApp = window.ethereum && window.ethereum.isMetaMask;
  }

  async initializeSDK() {
    if (this.sdk || this.isInitializing) return this.sdk;
    
    this.isInitializing = true;
    
    try {
      // MetaMaskアプリ内ブラウザの場合は直接接続
      if (this.isMetaMaskApp) {
        console.log('MetaMask app detected, using direct connection');
        return null;
      }

      // 動的インポートでMetaMask SDKを遅延読み込み
      const { MetaMaskSDK } = await import('@metamask/sdk');
      
      // モバイル向けに最適化した設定
      this.sdk = new MetaMaskSDK({
        dappMetadata: {
          name: 'NFT Mint App',
          url: window.location.origin,
        },
        // モバイルでは直接ディープリンクを使用
        preferDesktop: false,
        forceInjectProvider: true,
        // モバイル用のディープリンク設定
        openDeeplink: (link) => {
          console.log('Opening deeplink:', link);
          if (this.isMobile) {
            // metamask://でディープリンクを開く
            const metamaskDeeplink = link.replace('https://', 'metamask://');
            window.location.href = metamaskDeeplink;
            
            // フォールバック：3秒後に通常のリンクを開く
            setTimeout(() => {
              window.location.href = link;
            }, 3000);
          } else {
            window.open(link, '_blank');
          }
        },
        // モバイルでは接続を維持しない
        storage: {
          enabled: false,
        },
        // モバイル最適化設定
        checkInstallationImmediately: false,
        communicationLayerPreference: 'socket',
        connectTimeout: 5000,
        logging: {
          developerMode: false,
          sdk: false,
        },
        // インストールモーダルをカスタマイズ
        modals: {
          install: ({ link }) => {
            const message = this.isMobile 
              ? 'MetaMaskアプリをインストールしてください。インストール後、MetaMaskアプリ内のブラウザからこのサイトにアクセスしてください。'
              : 'MetaMask拡張機能をインストールしてください。';
            
            if (confirm(message)) {
              if (this.isMobile) {
                // App StoreまたはGoogle Playへ直接リンク
                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                const storeLink = isIOS 
                  ? 'https://apps.apple.com/app/metamask-blockchain-wallet/id1438144202'
                  : 'https://play.google.com/store/apps/details?id=io.metamask';
                window.location.href = storeLink;
              } else {
                window.open(link, '_blank');
              }
            }
            return true;
          },
          otp: () => {
            return {
              mount: () => {},
              updateOTPValue: () => {},
            };
          },
        },
      });
      
      return this.sdk;
    } catch (error) {
      console.error('Error initializing MetaMask SDK:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async connect() {
    try {
      // MetaMaskアプリ内ブラウザの場合
      if (this.isMetaMaskApp) {
        console.log('Connecting via MetaMask app browser');
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
      } else {
        // 通常のブラウザの場合はSDKを使用
        if (!this.sdk) {
          await this.initializeSDK();
        }
        
        // モバイルの場合は接続前に警告を表示
        if (this.isMobile && !this.isMetaMaskApp) {
          alert('MetaMaskアプリ内のブラウザからアクセスすることを推奨します。\n\n接続がうまくいかない場合は、MetaMaskアプリを開いて、アプリ内のブラウザからこのサイトにアクセスしてください。');
        }
        
        const accounts = await this.sdk.connect();
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }

        this.ethereum = this.sdk.getProvider();
        this.provider = new ethers.BrowserProvider(this.ethereum);
        this.signer = await this.provider.getSigner();
        this.account = accounts[0];
      }

      // チェーンの切り替え
      await this.switchToCorrectChain();

      // イベントリスナーの設定
      this.setupEventListeners();

      return this.account;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // モバイル特有のエラーメッセージ
      if (this.isMobile && !this.isMetaMaskApp) {
        if (error.message.includes('User rejected') || error.message.includes('user rejected')) {
          throw new Error('接続がキャンセルされました。MetaMaskアプリ内のブラウザからアクセスしてください。');
        } else if (error.message.includes('timeout')) {
          throw new Error('接続がタイムアウトしました。MetaMaskアプリが開いているか確認してください。');
        }
      }
      
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
    if (this.ethereum && this.sdk) {
      this.sdk.terminate();
    }
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.ethereum = null;
    this.sdk = null;
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

  // モバイルかどうかを判定
  isMobileDevice() {
    return this.isMobile;
  }

  // MetaMaskアプリ内ブラウザかどうかを判定
  isInMetaMaskApp() {
    return this.isMetaMaskApp;
  }
}

export const walletManager = new WalletManager();