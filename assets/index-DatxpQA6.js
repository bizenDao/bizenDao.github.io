import{a as C,B as S,C as T,f as p,i as I,t as M}from"./vendor-CHLi3DJm.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))l(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&l(c)}).observe(document,{childList:!0,subtree:!0});function i(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function l(a){if(a.ep)return;a.ep=!0;const o=i(a);fetch(a.href,o)}})();const g="0x1234567890123456789012345678901234567890",P=[{inputs:[{internalType:"address",name:"to",type:"address"}],name:"mint",outputs:[],stateMutability:"payable",type:"function"},{inputs:[],name:"mintPrice",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"totalSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"maxSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"from",type:"address"},{indexed:!0,internalType:"address",name:"to",type:"address"},{indexed:!0,internalType:"uint256",name:"tokenId",type:"uint256"}],name:"Transfer",type:"event"}],h={chainId:"0x89",chainName:"Polygon Mainnet",nativeCurrency:{name:"MATIC",symbol:"MATIC",decimals:18},rpcUrls:["https://polygon-rpc.com/","https://rpc-mainnet.maticvigil.com/"],blockExplorerUrls:["https://polygonscan.com/"]};var x={};const m=new C({dappMetadata:{name:"NFT Mint App",url:window.location.origin},infuraAPIKey:x.VITE_INFURA_API_KEY,preferDesktop:!1,openDeeplink:n=>{window.open&&window.open(n,"_blank")},storage:{enabled:!0},modals:{install:({link:n})=>(confirm("MetaMask is not installed. Would you like to install it?")&&window.open(n,"_blank"),!0),otp:()=>({mount:()=>{},updateOTPValue:()=>{}})}});class N{constructor(){this.provider=null,this.signer=null,this.account=null,this.ethereum=null}async connect(){try{const t=await m.connect();if(!t||t.length===0)throw new Error("No accounts found");return this.ethereum=m.getProvider(),this.provider=new S(this.ethereum),this.signer=await this.provider.getSigner(),this.account=t[0],await this.switchToCorrectChain(),this.ethereum.on("accountsChanged",i=>{i.length===0?this.disconnect():(this.account=i[0],window.location.reload())}),this.ethereum.on("chainChanged",()=>{window.location.reload()}),this.account}catch(t){throw console.error("Error connecting wallet:",t),t}}async switchToCorrectChain(){try{if(await this.ethereum.request({method:"eth_chainId"})!==h.chainId)try{await this.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:h.chainId}]})}catch(i){if(i.code===4902)await this.ethereum.request({method:"wallet_addEthereumChain",params:[h]});else throw i}}catch(t){throw console.error("Error switching chain:",t),t}}disconnect(){this.ethereum&&m.terminate(),this.provider=null,this.signer=null,this.account=null,this.ethereum=null}getAccount(){return this.account}getSigner(){return this.signer}getProvider(){return this.provider}isConnected(){return this.account!==null}formatAddress(t){return t?`${t.substring(0,6)}...${t.substring(t.length-4)}`:""}}const r=new N;class A{constructor(){this.contract=null,this.mintPrice=null,this.totalSupply=null,this.maxSupply=null}async initialize(){if(!r.isConnected())throw new Error("Wallet not connected");const t=r.getSigner();this.contract=new T(g,P,t),await this.fetchContractData()}async fetchContractData(){try{const[t,i,l]=await Promise.all([this.contract.mintPrice(),this.contract.totalSupply(),this.contract.maxSupply()]);return this.mintPrice=t,this.totalSupply=i,this.maxSupply=l,{mintPrice:p(t),totalSupply:i.toString(),maxSupply:l.toString()}}catch(t){throw console.error("Error fetching contract data:",t),t}}async mint(t=1){if(!this.contract)throw new Error("Contract not initialized");try{const i=this.mintPrice*BigInt(t),a=await this.contract.mint.estimateGas(r.getAccount(),{value:i})*110n/100n,c=await(await this.contract.mint(r.getAccount(),{value:i,gasLimit:a})).wait(),f=c.logs.find(b=>b.topics[0]===I("Transfer(address,address,uint256)"));let y=null;return f&&(y=M(f.topics[3]).toString()),{transactionHash:c.hash,tokenId:y,status:c.status===1?"success":"failed"}}catch(i){throw console.error("Error minting NFT:",i),i}}async checkAvailability(){(!this.totalSupply||!this.maxSupply)&&await this.fetchContractData();const t=this.maxSupply-this.totalSupply;return{available:t>0n,remaining:t.toString(),soldOut:t===0n}}getMintPrice(){return this.mintPrice?p(this.mintPrice):null}getContractInfo(){return{address:g,mintPrice:this.mintPrice?p(this.mintPrice):null,totalSupply:this.totalSupply?this.totalSupply.toString():null,maxSupply:this.maxSupply?this.maxSupply.toString():null}}}const d=new A,F=document.querySelector("#app");let e={isConnected:!1,isLoading:!1,mintQuantity:1,message:null,contractInfo:null};function s(n){e={...e,...n},v()}function u(n,t="info"){s({message:{text:n,type:t}}),t!=="error"&&setTimeout(()=>s({message:null}),5e3)}async function w(){s({isLoading:!0,message:null});try{const n=await r.connect();s({isConnected:!0,isLoading:!1}),u("Wallet connected successfully!","success"),L()}catch(n){console.error("Connection error:",n),s({isLoading:!1}),u(n.message||"Failed to connect wallet","error")}}async function L(){try{await d.initialize();const n=await d.fetchContractData();s({contractInfo:n})}catch(n){console.error("Failed to load contract info:",n),u("Failed to load NFT contract information","error")}}async function $(){r.disconnect(),s({isConnected:!1,contractInfo:null,message:null})}async function E(){s({isLoading:!0,message:null});try{u("Transaction pending...","info");const n=await d.mint(e.mintQuantity);s({isLoading:!1,mintQuantity:1});const t=`https://polygonscan.com/tx/${n.transactionHash}`;u(`NFT minted successfully! <a href="${t}" target="_blank" class="transaction-link">View transaction</a>`,"success");const i=await d.fetchContractData();s({contractInfo:i})}catch(n){console.error("Minting error:",n),s({isLoading:!1});let t="Failed to mint NFT";n.message.includes("insufficient funds")?t="Insufficient funds for transaction":n.message.includes("user rejected")&&(t="Transaction cancelled by user"),u(t,"error")}}function _(n){const t=Math.max(1,Math.min(10,e.mintQuantity+n));s({mintQuantity:t})}function v(){F.innerHTML=`
    <div class="header">
      <h1>NFT Mint App</h1>
      <p class="subtitle">Mint your NFT directly from mobile browser</p>
    </div>

    ${e.message?`
      <div class="message ${e.message.type}">
        ${e.message.text}
      </div>
    `:""}

    <div class="wallet-section">
      ${e.isConnected?`
        <div class="wallet-info">
          <span class="wallet-address">${r.formatAddress(r.getAccount())}</span>
        </div>
        <button class="secondary" onclick="window.app.disconnectWallet()" ${e.isLoading?"disabled":""}>
          Disconnect
        </button>
      `:`
        <button onclick="window.app.connectWallet()" ${e.isLoading?"disabled":""}>
          ${e.isLoading?'<span class="loading"></span>Connecting...':"Connect Wallet"}
        </button>
      `}
    </div>

    ${e.isConnected?`
      <div class="mint-section">
        ${e.contractInfo?`
          <div class="contract-info">
            <div class="info-item">
              <div class="info-label">Price</div>
              <div class="info-value">${e.contractInfo.mintPrice} MATIC</div>
            </div>
            <div class="info-item">
              <div class="info-label">Minted</div>
              <div class="info-value">${e.contractInfo.totalSupply}/${e.contractInfo.maxSupply}</div>
            </div>
          </div>

          <div class="mint-controls">
            <div class="quantity-selector">
              <button class="quantity-button secondary" onclick="window.app.updateQuantity(-1)">-</button>
              <span class="quantity">${e.mintQuantity}</span>
              <button class="quantity-button secondary" onclick="window.app.updateQuantity(1)">+</button>
            </div>
            
            <div class="total-price">
              Total: ${(parseFloat(e.contractInfo.mintPrice)*e.mintQuantity).toFixed(4)} MATIC
            </div>

            <button onclick="window.app.mintNFT()" ${e.isLoading?"disabled":""}>
              ${e.isLoading?'<span class="loading"></span>Minting...':"Mint NFT"}
            </button>
          </div>
        `:`
          <div class="loading-contract">
            <span class="loading"></span>
            <p>Loading contract information...</p>
          </div>
        `}
      </div>
    `:""}
  `}window.app={connectWallet:w,disconnectWallet:$,mintNFT:E,updateQuantity:_};v();typeof window.ethereum<"u"&&window.ethereum.request({method:"eth_accounts"}).then(n=>{n.length>0&&w()});
