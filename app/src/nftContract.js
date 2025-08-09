import { ethers } from 'ethers';
import { walletManager } from './wallet';
import { CHAIN_CONFIG, CONTRACT_ADDRESSES } from './config';
import BizenDaoNFT_ABI from './BizenDaoNFT_ABI';

class NFTContract {
  constructor() {
    this.contract = null;
    this.provider = null;
    this.signer = null;
  }

  async initialize() {
    try {
      // NFTページでは常にRPCプロバイダーを使用（読み取り専用）
      console.log('Initializing NFT contract with RPC provider');
      
      // プライベートチェーンのRPCを使用（本番環境ではCORSエラーなし）
      this.provider = new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrls[0]);
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESSES.BIZENDAO_NFT,
        BizenDaoNFT_ABI,
        this.provider
      );
      
      console.log('Connected to:', CHAIN_CONFIG.chainName);
      console.log('NFT Contract:', CONTRACT_ADDRESSES.BIZENDAO_NFT);
      
      // コントラクトの存在確認
      try {
        const name = await this.contract.name();
        console.log('Contract name:', name);
        return true;
      } catch (err) {
        console.error('Contract not found or ABI mismatch:', err);
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize NFT contract:', error);
      return false;
    }
  }

  async fetchUserNFTs(address) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      // Get user's NFT balance
      const balance = await this.contract.balanceOf(address);
      const balanceNumber = Number(balance);
      const nfts = [];

      // Fetch each NFT owned by the user
      for (let i = 0; i < balanceNumber; i++) {
        const tokenId = await this.contract.tokenOfOwnerByIndex(address, i);
        console.log(`Fetching NFT #${tokenId}`);
        
        let tokenURI = '';
        let metadata = {};
        
        try {
          tokenURI = await this.contract.tokenURI(tokenId);
          console.log(`Token URI for #${tokenId}:`, tokenURI);
        } catch (err) {
          console.error(`Failed to get tokenURI for #${tokenId}:`, err);
          // Use default metadata if tokenURI fails
          metadata = {
            name: `BizenDao NFT #${tokenId}`,
            description: 'BizenDao NFT',
            image: './assets/logo.jpg'
          };
        }
        
        const isLocked = await this.contract.isLocked(tokenId);
        const creator = await this.contract.tokenCreator(tokenId);

        // Parse metadata from tokenURI if available
        if (tokenURI) {
          try {
            if (tokenURI.startsWith('data:application/json;base64,')) {
              const base64Data = tokenURI.split(',')[1];
              const jsonString = atob(base64Data);
              metadata = JSON.parse(jsonString);
            } else if (tokenURI.startsWith('http') || tokenURI.startsWith('ipfs://')) {
              console.log(`External URI detected: ${tokenURI}`);
              
              // Arweaveの場合は直接フェッチを試みる
              if (tokenURI.includes('arweave.net')) {
                try {
                  const response = await fetch(tokenURI);
                  if (response.ok) {
                    metadata = await response.json();
                    console.log(`Fetched metadata from Arweave:`, metadata);
                  } else {
                    throw new Error('Failed to fetch from Arweave');
                  }
                } catch (fetchErr) {
                  console.error('Failed to fetch metadata from Arweave:', fetchErr);
                  // CORSエラーの場合はプロキシを使用
                  try {
                    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(tokenURI)}`;
                    const proxyResponse = await fetch(proxyUrl);
                    if (proxyResponse.ok) {
                      metadata = await proxyResponse.json();
                      console.log(`Fetched metadata via proxy:`, metadata);
                    }
                  } catch (proxyErr) {
                    console.error('Proxy fetch also failed:', proxyErr);
                    metadata = {
                      name: `BizenDao NFT #${tokenId}`,
                      description: 'BizenDao NFT',
                      image: './assets/logo.jpg'
                    };
                  }
                }
              } else {
                // その他の外部URI
                metadata = {
                  name: `BizenDao NFT #${tokenId}`,
                  description: 'BizenDao NFT',
                  image: './assets/logo.jpg'
                };
              }
            } else {
              // Plain JSON string
              metadata = JSON.parse(tokenURI);
            }
          } catch (err) {
            console.error('Failed to parse metadata:', err);
            metadata = {
              name: `BizenDao NFT #${tokenId}`,
              description: 'BizenDao NFT',
              image: './assets/logo.jpg'
            };
          }
        }

        nfts.push({
          tokenId: tokenId.toString(),
          name: metadata.name || `BizenDao NFT #${tokenId}`,
          description: metadata.description || '',
          image: metadata.image || '/assets/logo.jpg',
          isLocked,
          creator,
          tokenURI
        });
      }

      return nfts;
    } catch (error) {
      console.error('Failed to fetch user NFTs:', error);
      return [];
    }
  }

  async fetchAllNFTs(limit = 50) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      const totalSupply = await this.contract.totalSupply();
      const nfts = [];
      // Convert BigInt to number for comparison
      const totalSupplyNumber = Number(totalSupply);
      const maxToFetch = Math.min(totalSupplyNumber, limit);

      // Fetch recent NFTs (from newest to oldest)
      for (let i = totalSupplyNumber - 1; i >= totalSupplyNumber - maxToFetch && i >= 0; i--) {
        try {
          const tokenId = await this.contract.tokenByIndex(i);
          console.log(`Fetching NFT at index ${i}, tokenId: ${tokenId}`);
          
          const owner = await this.contract.ownerOf(tokenId);
          const isLocked = await this.contract.isLocked(tokenId);
          const creator = await this.contract.tokenCreator(tokenId);
          
          let tokenURI = '';
          let metadata = {};
          
          try {
            tokenURI = await this.contract.tokenURI(tokenId);
            console.log(`Token URI for #${tokenId}:`, tokenURI);
          } catch (err) {
            console.error(`Failed to get tokenURI for #${tokenId}:`, err);
            metadata = {
              name: `BizenDao NFT #${tokenId}`,
              description: 'BizenDao NFT',
              image: './assets/logo.jpg'
            };
          }

          // Parse metadata
          if (tokenURI) {
            try {
              if (tokenURI.startsWith('data:application/json;base64,')) {
                const base64Data = tokenURI.split(',')[1];
                const jsonString = atob(base64Data);
                metadata = JSON.parse(jsonString);
              } else if (tokenURI.startsWith('http') || tokenURI.startsWith('ipfs://')) {
                console.log(`External URI detected: ${tokenURI}`);
                
                // Arweaveの場合は直接フェッチを試みる
                if (tokenURI.includes('arweave.net')) {
                  try {
                    const response = await fetch(tokenURI);
                    if (response.ok) {
                      metadata = await response.json();
                      console.log(`Fetched metadata from Arweave:`, metadata);
                    } else {
                      throw new Error('Failed to fetch from Arweave');
                    }
                  } catch (fetchErr) {
                    console.error('Failed to fetch metadata from Arweave:', fetchErr);
                    // CORSエラーの場合はプロキシを使用
                    try {
                      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(tokenURI)}`;
                      const proxyResponse = await fetch(proxyUrl);
                      if (proxyResponse.ok) {
                        metadata = await proxyResponse.json();
                        console.log(`Fetched metadata via proxy:`, metadata);
                      }
                    } catch (proxyErr) {
                      console.error('Proxy fetch also failed:', proxyErr);
                      metadata = {
                        name: `BizenDao NFT #${tokenId}`,
                        description: 'BizenDao NFT',
                        image: './assets/logo.jpg'
                      };
                    }
                  }
                } else {
                  // その他の外部URI
                  metadata = {
                    name: `BizenDao NFT #${tokenId}`,
                    description: 'BizenDao NFT',
                    image: './assets/logo.jpg'
                  };
                }
              } else {
                // Plain JSON string
                metadata = JSON.parse(tokenURI);
              }
            } catch (err) {
              console.error('Failed to parse metadata:', err);
              metadata = {
                name: `BizenDao NFT #${tokenId}`,
                description: 'BizenDao NFT',
                image: './assets/logo.jpg'
              };
            }
          }

          nfts.push({
            tokenId: tokenId.toString(),
            name: metadata.name || `BizenDao NFT #${tokenId}`,
            description: metadata.description || '',
            image: metadata.image || '/assets/logo.jpg',
            owner,
            creator,
            isLocked,
            tokenURI
          });
        } catch (err) {
          console.error(`Failed to fetch NFT #${i}:`, err);
        }
      }

      return nfts;
    } catch (error) {
      console.error('Failed to fetch all NFTs:', error);
      return [];
    }
  }

  async getContractInfo() {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      const [name, symbol, totalSupply, mintFee] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.totalSupply(),
        this.contract.mintFee()
      ]);

      return {
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        mintFee: ethers.formatEther(mintFee),
        address: CONTRACT_ADDRESSES.BIZENDAO_NFT
      };
    } catch (error) {
      console.error('Failed to get contract info:', error);
      return null;
    }
  }
}

export const nftContract = new NFTContract();