import{a as L,B as D,C as T,f as M,i as U,t as $}from"./vendor-CHLi3DJm.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();const z={chainId:"0x52d1",chainName:"BizenDao Private Chain",nativeCurrency:{name:"DEV Token",symbol:"DEV",decimals:18},rpcUrls:["http://dev2.bon-soleil.com/rpc"],blockExplorerUrls:[]},w=z,S="0x166748e744195650a94FC32C64d8f0c9329f96F1";function F(n,e="tx"){return!w.blockExplorerUrls||w.blockExplorerUrls.length===0?null:`${w.blockExplorerUrls[0]}${e}/${n}`}var k={};const E=new L({dappMetadata:{name:"NFT Mint App",url:window.location.origin},infuraAPIKey:k.VITE_INFURA_API_KEY,preferDesktop:!1,openDeeplink:n=>{window.open&&window.open(n,"_blank")},storage:{enabled:!0},modals:{install:({link:n})=>(confirm("MetaMask is not installed. Would you like to install it?")&&window.open(n,"_blank"),!0),otp:()=>({mount:()=>{},updateOTPValue:()=>{}})}});class q{constructor(){this.provider=null,this.signer=null,this.account=null,this.ethereum=null}async connect(){try{const e=await E.connect();if(!e||e.length===0)throw new Error("No accounts found");return this.ethereum=E.getProvider(),this.provider=new D(this.ethereum),this.signer=await this.provider.getSigner(),this.account=e[0],await this.switchToCorrectChain(),this.ethereum.on("accountsChanged",t=>{t.length===0?this.disconnect():(this.account=t[0],window.location.reload())}),this.ethereum.on("chainChanged",()=>{window.location.reload()}),this.account}catch(e){throw console.error("Error connecting wallet:",e),e}}async switchToCorrectChain(){try{if(await this.ethereum.request({method:"eth_chainId"})!==w.chainId)try{await this.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:w.chainId}]})}catch(t){if(t.code===4902)await this.ethereum.request({method:"wallet_addEthereumChain",params:[w]});else throw t}}catch(e){throw console.error("Error switching chain:",e),e}}disconnect(){this.ethereum&&E.terminate(),this.provider=null,this.signer=null,this.account=null,this.ethereum=null}getAccount(){return this.account}getSigner(){return this.signer}getProvider(){return this.provider}isConnected(){return this.account!==null}formatAddress(e){return e?`${e.substring(0,6)}...${e.substring(e.length-4)}`:""}}const m=new q,C=[{inputs:[],name:"mint",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"mintPrice",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"totalSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"maxSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"}],name:"hasMinted",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"from",type:"address"},{indexed:!0,internalType:"address",name:"to",type:"address"},{indexed:!0,internalType:"uint256",name:"tokenId",type:"uint256"}],name:"Transfer",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"to",type:"address"},{indexed:!0,internalType:"uint256",name:"tokenId",type:"uint256"}],name:"Mint",type:"event"},{inputs:[{internalType:"string",name:"memberName",type:"string"},{internalType:"string",name:"discordId",type:"string"},{internalType:"string",name:"avatarImage",type:"string"}],name:"setUserInfo",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"user",type:"address"}],name:"getUserInfo",outputs:[{internalType:"string",name:"memberName",type:"string"},{internalType:"string",name:"discordId",type:"string"},{internalType:"string",name:"avatarImage",type:"string"}],stateMutability:"view",type:"function"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"user",type:"address"},{indexed:!1,internalType:"string",name:"memberName",type:"string"},{indexed:!1,internalType:"string",name:"discordId",type:"string"},{indexed:!1,internalType:"string",name:"avatarImage",type:"string"}],name:"UserInfoUpdated",type:"event"}];class _{constructor(){this.contract=null,this.mintPrice=null,this.totalSupply=null,this.maxSupply=null}async initialize(){if(!m.isConnected())throw new Error("Wallet not connected");const e=m.getSigner();this.contract=new T(S,C,e),await this.fetchContractData()}async fetchContractData(){try{const[e,t,i]=await Promise.all([this.contract.mintPrice(),this.contract.totalSupply(),this.contract.maxSupply()]);return this.mintPrice=e,this.totalSupply=t,this.maxSupply=i,{mintPrice:M(e),totalSupply:t.toString(),maxSupply:i.toString()}}catch(e){throw console.error("Error fetching contract data:",e),e}}async mint(e=1){if(!this.contract)throw new Error("Contract not initialized");try{if(await this.contract.hasMinted(m.getAccount()))throw new Error("You have already minted your membership card");const a=await this.contract.mint.estimateGas()*110n/100n,s=await(await this.contract.mint({gasLimit:a})).wait(),c=s.logs.find(d=>d.topics[0]===U("Mint(address,uint256)"));let u=null;return c&&(u=$(c.topics[2]).toString()),{transactionHash:s.hash,tokenId:u,status:s.status===1?"success":"failed"}}catch(t){throw console.error("Error minting NFT:",t),t}}async checkAvailability(){(!this.totalSupply||!this.maxSupply)&&await this.fetchContractData();const e=this.maxSupply-this.totalSupply;return{available:e>0n,remaining:e.toString(),soldOut:e===0n}}getMintPrice(){return this.mintPrice?M(this.mintPrice):null}getContractInfo(){return{address:S,mintPrice:this.mintPrice?M(this.mintPrice):null,totalSupply:this.totalSupply?this.totalSupply.toString():null,maxSupply:this.maxSupply?this.maxSupply.toString():null}}}const I=new _,y="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjQwIiBmaWxsPSIjNjY3ZWVhIi8+PHBhdGggZD0iTTEwMCwxMzBjLTQwLDAuNS04MCwyMC04MCw1MHYyMGgxNjB2LTIwQzE4MCwxNTAsMTQwLDEzMC41LDEwMCwxMzB6IiBmaWxsPSIjNjY3ZWVhIi8+PC9zdmc+";async function j(n,e={}){const{maxWidth:t=200,maxHeight:i=200,quality:a=.8}=e;return new Promise((r,s)=>{const c=new FileReader;c.onload=u=>{const d=new Image;d.onload=()=>{const l=document.createElement("canvas"),g=l.getContext("2d");let p=d.width,f=d.height;p>f?p>t&&(f=Math.round(f*t/p),p=t):f>i&&(p=Math.round(p*i/f),f=i),l.width=p,l.height=f,g.drawImage(d,0,0,p,f);const B=l.toDataURL("image/jpeg",a);r(B)},d.onerror=()=>{s(new Error("Failed to load image"))},d.src=u.target.result},c.onerror=()=>{s(new Error("Failed to read file"))},c.readAsDataURL(n)})}function H(n,e={}){const{maxSizeMB:t=2,allowedTypes:i=["image/jpeg","image/jpg","image/png","image/gif","image/webp"]}=e;if(!i.includes(n.type))return{valid:!1,error:`Invalid file type. Allowed types: ${i.join(", ")}`};const a=t*1024*1024;return n.size>a?{valid:!1,error:`File size too large. Maximum size: ${t}MB`}:{valid:!0}}function x(n){const t=(n.split(",")[1]||n).length*3/4;return Math.round(t/1024)}class W{constructor(){this.contract=null,this.currentUserInfo=null}async initialize(){m.getProvider();const e=m.getSigner();if(!e)throw new Error("No wallet connected");this.contract=new T(S,C,e)}async getUserInfo(e=null){this.contract||await this.initialize();const t=e||m.getAccount();if(!t)throw new Error("No address provided");try{const[i,a,r]=await this.contract.getUserInfo(t);return this.currentUserInfo={memberName:i,discordId:a,avatarImage:r||y,address:t},this.currentUserInfo}catch(i){throw console.error("Error fetching user info:",i),new Error("Failed to fetch user information")}}async setUserInfo({memberName:e,discordId:t,avatarImage:i}){if(this.contract||await this.initialize(),!await this.contract.hasMinted(m.getAccount()))throw new Error("You must mint a membership card first");if(!e||e.trim().length===0)throw new Error("Member name is required");if(!t||t.trim().length===0)throw new Error("Discord ID is required");const r=i||"";if(r&&r!==y){const s=x(r);if(s>100)throw new Error(`Avatar image too large (${s}KB). Maximum size: 100KB`)}try{const c=await(await this.contract.setUserInfo(e.trim(),t.trim(),r)).wait();return this.currentUserInfo={memberName:e.trim(),discordId:t.trim(),avatarImage:r||y,address:m.getAccount()},c}catch(s){throw console.error("Error setting user info:",s),s.message.includes("user rejected")?new Error("Transaction cancelled by user"):new Error("Failed to update user information")}}async processAvatarImage(e){const t=H(e,{maxSizeMB:1,allowedTypes:["image/jpeg","image/jpg","image/png","image/webp"]});if(!t.valid)throw new Error(t.error);const i=await j(e,{maxWidth:200,maxHeight:200,quality:.7}),a=x(i);if(a>100)throw new Error(`Processed image still too large (${a}KB). Try a simpler image.`);return i}createProfileUI(){const e=document.createElement("div");return e.className="user-profile-container",e.innerHTML=`
      <div class="profile-header">
        <h3>Member Profile</h3>
        <p class="profile-subtitle">Update your membership information</p>
      </div>
      
      <div class="profile-form">
        <div class="avatar-section">
          <div class="avatar-preview" id="avatarPreview">
            <img src="${y}" alt="Avatar preview" />
          </div>
          <div class="avatar-upload">
            <input type="file" id="avatarInput" accept="image/*" style="display: none;" />
            <button class="secondary small" id="uploadButton">Choose Avatar</button>
            <button class="secondary small" id="removeButton" style="display: none;">Remove</button>
            <p class="avatar-info">Max 200x200px, 100KB</p>
          </div>
        </div>
        
        <div class="form-group">
          <label for="memberName">Member Name</label>
          <input type="text" id="memberName" placeholder="Enter your name" maxlength="50" />
        </div>
        
        <div class="form-group">
          <label for="discordId">Discord ID</label>
          <input type="text" id="discordId" placeholder="username#1234" maxlength="50" />
        </div>
        
        <div class="profile-actions">
          <button id="saveProfile" class="primary">Save Profile</button>
          <button id="loadProfile" class="secondary">Refresh</button>
        </div>
        
        <div id="profileMessage" class="message" style="display: none;"></div>
      </div>
    `,this.attachEventListeners(e),e}attachEventListeners(e){const t=e.querySelector("#avatarInput"),i=e.querySelector("#uploadButton"),a=e.querySelector("#removeButton"),r=e.querySelector("#avatarPreview img"),s=e.querySelector("#saveProfile"),c=e.querySelector("#loadProfile"),u=e.querySelector("#profileMessage");let d=null;i.addEventListener("click",()=>{t.click()}),t.addEventListener("change",async l=>{const g=l.target.files[0];if(g)try{u.style.display="none",i.disabled=!0,i.textContent="Processing...",d=await this.processAvatarImage(g),r.src=d,a.style.display="inline-block",i.textContent="Change Avatar"}catch(p){this.showMessage(u,p.message,"error"),i.textContent="Choose Avatar"}finally{i.disabled=!1}}),a.addEventListener("click",()=>{d=null,r.src=y,t.value="",a.style.display="none"}),s.addEventListener("click",async()=>{const l=e.querySelector("#memberName").value,g=e.querySelector("#discordId").value;try{u.style.display="none",s.disabled=!0,s.innerHTML='<span class="loading"></span>Saving...',await this.setUserInfo({memberName:l,discordId:g,avatarImage:d}),this.showMessage(u,"Profile updated successfully!","success")}catch(p){this.showMessage(u,p.message,"error")}finally{s.disabled=!1,s.textContent="Save Profile"}}),c.addEventListener("click",async()=>{try{u.style.display="none",c.disabled=!0,c.innerHTML='<span class="loading"></span>Loading...';const l=await this.getUserInfo();e.querySelector("#memberName").value=l.memberName||"",e.querySelector("#discordId").value=l.discordId||"",r.src=l.avatarImage||y,l.avatarImage&&l.avatarImage!==y&&(d=l.avatarImage,a.style.display="inline-block"),this.showMessage(u,"Profile loaded successfully!","success")}catch(l){this.showMessage(u,l.message,"error")}finally{c.disabled=!1,c.textContent="Refresh"}})}showMessage(e,t,i){e.textContent=t,e.className=`message ${i}`,e.style.display="block",i==="success"&&setTimeout(()=>{e.style.display="none"},5e3)}}const b=new W,O=document.querySelector("#app");let o={isConnected:!1,isLoading:!1,mintQuantity:1,message:null,contractInfo:null,hasMinted:!1,profileElement:null};function h(n){o={...o,...n},A()}function v(n,e="info"){h({message:{text:n,type:e}}),e!=="error"&&setTimeout(()=>h({message:null}),5e3)}async function P(){h({isLoading:!0,message:null});try{const n=await m.connect();h({isConnected:!0,isLoading:!1}),v("Wallet connected successfully!","success"),N()}catch(n){console.error("Connection error:",n),h({isLoading:!1}),v(n.message||"Failed to connect wallet","error")}}async function N(){try{await I.initialize();const n=await I.fetchContractData(),e=m.getAccount(),t=await I.contract.hasMinted(e);let i=null;if(t&&!o.profileElement){await b.initialize(),i=b.createProfileUI();try{await b.getUserInfo();const a=b.currentUserInfo;a&&(i.querySelector("#memberName").value=a.memberName||"",i.querySelector("#discordId").value=a.discordId||"",a.avatarImage&&a.avatarImage!==y&&(i.querySelector("#avatarPreview img").src=a.avatarImage,i.querySelector("#removeButton").style.display="inline-block"))}catch{console.log("No existing profile data")}}h({contractInfo:n,hasMinted:t,profileElement:i})}catch(n){console.error("Failed to load contract info:",n),v("Failed to load NFT contract information","error")}}async function R(){m.disconnect(),h({isConnected:!1,contractInfo:null,message:null,hasMinted:!1,profileElement:null})}async function K(){h({isLoading:!0,message:null});try{v("Transaction pending...","info");const n=await I.mint(1);h({isLoading:!1});const e=F(n.transactionHash),t=e?`Membership card minted successfully! <a href="${e}" target="_blank" class="transaction-link">View transaction</a>`:`Membership card minted successfully! Transaction: ${n.transactionHash}`;v(t,"success"),await N()}catch(n){console.error("Minting error:",n),h({isLoading:!1});let e="Failed to mint membership card";n.message.includes("already minted")?e="You have already minted your membership card":n.message.includes("insufficient funds")?e="Insufficient funds for gas fees":n.message.includes("user rejected")&&(e="Transaction cancelled by user"),v(e,"error")}}function Q(n){const e=Math.max(1,Math.min(10,o.mintQuantity+n));h({mintQuantity:e})}function A(){if(O.innerHTML=`
    <div class="header">
      <h1>BizenDao Members Card</h1>
      <p class="subtitle">Mint your membership SBT directly from mobile browser</p>
      <p class="dev-notice">🛠️ Development Mode - Private Chain</p>
    </div>

    ${o.message?`
      <div class="message ${o.message.type}">
        ${o.message.text}
      </div>
    `:""}

    <div class="wallet-section">
      ${o.isConnected?`
        <div class="wallet-info">
          <span class="wallet-address">${m.formatAddress(m.getAccount())}</span>
        </div>
        <button class="secondary" onclick="window.app.disconnectWallet()" ${o.isLoading?"disabled":""}>
          Disconnect
        </button>
      `:`
        <button onclick="window.app.connectWallet()" ${o.isLoading?"disabled":""}>
          ${o.isLoading?'<span class="loading"></span>Connecting...':"Connect Wallet"}
        </button>
      `}
    </div>

    ${o.isConnected?`
      ${o.hasMinted?"":`
        <div class="mint-section">
          ${o.contractInfo?`
            <div class="contract-info">
              <div class="info-item">
                <div class="info-label">Price</div>
                <div class="info-value">FREE</div>
              </div>
              <div class="info-item">
                <div class="info-label">Minted</div>
                <div class="info-value">${o.contractInfo.totalSupply}/${o.contractInfo.maxSupply}</div>
              </div>
            </div>

            <div class="mint-controls">
              <div class="sbt-info">
                <p class="sbt-notice">🎫 One membership card per wallet</p>
                <p class="sbt-notice">💎 Soul Bound Token (Non-transferable)</p>
                <p class="sbt-notice">🆓 Free mint (gas only)</p>
              </div>

              <button onclick="window.app.mintNFT()" ${o.isLoading?"disabled":""}>
                ${o.isLoading?'<span class="loading"></span>Minting...':"Mint Membership Card"}
              </button>
            </div>
          `:`
            <div class="loading-contract">
              <span class="loading"></span>
              <p>Loading contract information...</p>
            </div>
          `}
        </div>
      `}
      
      <div id="profileContainer"></div>
    `:""}
  `,o.profileElement&&o.hasMinted){const n=document.getElementById("profileContainer");n&&n.appendChild(o.profileElement)}}window.app={connectWallet:P,disconnectWallet:R,mintNFT:K,updateQuantity:Q};A();typeof window.ethereum<"u"&&window.ethereum.request({method:"eth_accounts"}).then(n=>{n.length>0&&P()});
