import { MetaMaskSDK } from '@metamask/sdk';
import { ethers } from 'ethers';
import { CHAIN_CONFIG } from './config';

// Initialize MetaMask SDK
const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: 'NFT Mint App',
    url: window.location.origin,
  },
  infuraAPIKey: process.env.VITE_INFURA_API_KEY,
  preferDesktop: false,
  openDeeplink: (link) => {
    if (window.open) {
      window.open(link, '_blank');
    }
  },
  storage: {
    enabled: true,
  },
  modals: {
    install: ({ link }) => {
      if (confirm('MetaMask is not installed. Would you like to install it?')) {
        window.open(link, '_blank');
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

class WalletManager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.ethereum = null;
  }

  async connect() {
    try {
      const accounts = await MMSDK.connect();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.ethereum = MMSDK.getProvider();
      this.provider = new ethers.BrowserProvider(this.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = accounts[0];

      // Request correct chain
      await this.switchToCorrectChain();

      // Listen to account changes
      this.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.account = accounts[0];
          window.location.reload();
        }
      });

      // Listen to chain changes
      this.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      return this.account;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
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
          // This error code indicates that the chain has not been added to MetaMask
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
    if (this.ethereum) {
      MMSDK.terminate();
    }
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