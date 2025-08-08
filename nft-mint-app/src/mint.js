import { ethers } from 'ethers';
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from './contract';
import { walletManager } from './wallet';

class NFTMinter {
  constructor() {
    this.contract = null;
    this.mintPrice = null;
    this.totalSupply = null;
    this.maxSupply = null;
  }

  async initialize() {
    if (!walletManager.isConnected()) {
      throw new Error('Wallet not connected');
    }

    const signer = walletManager.getSigner();
    this.contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
    
    // Fetch contract data
    await this.fetchContractData();
  }

  async fetchContractData() {
    try {
      const [mintPrice, totalSupply, maxSupply] = await Promise.all([
        this.contract.mintPrice(),
        this.contract.totalSupply(),
        this.contract.maxSupply()
      ]);

      this.mintPrice = mintPrice;
      this.totalSupply = totalSupply;
      this.maxSupply = maxSupply;

      return {
        mintPrice: ethers.formatEther(mintPrice),
        totalSupply: totalSupply.toString(),
        maxSupply: maxSupply.toString()
      };
    } catch (error) {
      console.error('Error fetching contract data:', error);
      throw error;
    }
  }

  async mint(quantity = 1) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const totalPrice = this.mintPrice * BigInt(quantity);
      
      // Estimate gas
      const gasEstimate = await this.contract.mint.estimateGas(
        walletManager.getAccount(),
        { value: totalPrice }
      );

      // Add 10% buffer to gas estimate
      const gasLimit = (gasEstimate * 110n) / 100n;

      // Send transaction
      const tx = await this.contract.mint(
        walletManager.getAccount(),
        { 
          value: totalPrice,
          gasLimit: gasLimit
        }
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Find Transfer event to get token ID
      const transferEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id('Transfer(address,address,uint256)')
      );

      let tokenId = null;
      if (transferEvent) {
        tokenId = ethers.toBigInt(transferEvent.topics[3]).toString();
      }

      return {
        transactionHash: receipt.hash,
        tokenId: tokenId,
        status: receipt.status === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  async checkAvailability() {
    if (!this.totalSupply || !this.maxSupply) {
      await this.fetchContractData();
    }

    const available = this.maxSupply - this.totalSupply;
    return {
      available: available > 0n,
      remaining: available.toString(),
      soldOut: available === 0n
    };
  }

  getMintPrice() {
    if (!this.mintPrice) {
      return null;
    }
    return ethers.formatEther(this.mintPrice);
  }

  getContractInfo() {
    return {
      address: NFT_CONTRACT_ADDRESS,
      mintPrice: this.mintPrice ? ethers.formatEther(this.mintPrice) : null,
      totalSupply: this.totalSupply ? this.totalSupply.toString() : null,
      maxSupply: this.maxSupply ? this.maxSupply.toString() : null
    };
  }
}

export const nftMinter = new NFTMinter();