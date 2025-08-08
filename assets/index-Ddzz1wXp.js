import{a as L,B as $,C as T,f as M,i as U,t as z}from"./vendor-CHLi3DJm.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function a(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=a(i);fetch(i.href,s)}})();const k={chainId:"0x52d1",chainName:"BizenDao Private Chain",nativeCurrency:{name:"DEV Token",symbol:"DEV",decimals:18},rpcUrls:["http://dev2.bon-soleil.com/rpc"],blockExplorerUrls:[]},b=k,E="0x166748e744195650a94FC32C64d8f0c9329f96F1";function q(t,e="tx"){return!b.blockExplorerUrls||b.blockExplorerUrls.length===0?null:`${b.blockExplorerUrls[0]}${e}/${t}`}var j={};const x=new L({dappMetadata:{name:"NFT Mint App",url:window.location.origin},infuraAPIKey:j.VITE_INFURA_API_KEY,preferDesktop:!1,openDeeplink:t=>{window.open&&window.open(t,"_blank")},storage:{enabled:!0},modals:{install:({link:t})=>(confirm("MetaMask is not installed. Would you like to install it?")&&window.open(t,"_blank"),!0),otp:()=>({mount:()=>{},updateOTPValue:()=>{}})}});class _{constructor(){this.provider=null,this.signer=null,this.account=null,this.ethereum=null}async connect(){try{const e=await x.connect();if(!e||e.length===0)throw new Error("No accounts found");return this.ethereum=x.getProvider(),this.provider=new $(this.ethereum),this.signer=await this.provider.getSigner(),this.account=e[0],await this.switchToCorrectChain(),this.ethereum.on("accountsChanged",a=>{a.length===0?this.disconnect():(this.account=a[0],window.location.reload())}),this.ethereum.on("chainChanged",()=>{window.location.reload()}),this.account}catch(e){throw console.error("Error connecting wallet:",e),e}}async switchToCorrectChain(){try{if(await this.ethereum.request({method:"eth_chainId"})!==b.chainId)try{await this.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:b.chainId}]})}catch(a){if(a.code===4902)await this.ethereum.request({method:"wallet_addEthereumChain",params:[b]});else throw a}}catch(e){throw console.error("Error switching chain:",e),e}}disconnect(){this.ethereum&&x.terminate(),this.provider=null,this.signer=null,this.account=null,this.ethereum=null}getAccount(){return this.account}getSigner(){return this.signer}getProvider(){return this.provider}isConnected(){return this.account!==null}formatAddress(e){return e?`${e.substring(0,6)}...${e.substring(e.length-4)}`:""}}const p=new _,C=[{inputs:[],name:"mint",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"mintPrice",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"totalSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"maxSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"}],name:"hasMinted",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"from",type:"address"},{indexed:!0,internalType:"address",name:"to",type:"address"},{indexed:!0,internalType:"uint256",name:"tokenId",type:"uint256"}],name:"Transfer",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"to",type:"address"},{indexed:!0,internalType:"uint256",name:"tokenId",type:"uint256"}],name:"Mint",type:"event"},{inputs:[{internalType:"string",name:"memberName",type:"string"},{internalType:"string",name:"discordId",type:"string"},{internalType:"string",name:"avatarImage",type:"string"}],name:"setUserInfo",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"user",type:"address"}],name:"getUserInfo",outputs:[{internalType:"string",name:"memberName",type:"string"},{internalType:"string",name:"discordId",type:"string"},{internalType:"string",name:"avatarImage",type:"string"}],stateMutability:"view",type:"function"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"user",type:"address"},{indexed:!1,internalType:"string",name:"memberName",type:"string"},{indexed:!1,internalType:"string",name:"discordId",type:"string"},{indexed:!1,internalType:"string",name:"avatarImage",type:"string"}],name:"UserInfoUpdated",type:"event"}];class H{constructor(){this.contract=null,this.mintPrice=null,this.totalSupply=null,this.maxSupply=null}async initialize(){if(!p.isConnected())throw new Error("Wallet not connected");const e=p.getSigner();this.contract=new T(E,C,e),await this.fetchContractData()}async fetchContractData(){try{const[e,a,n]=await Promise.all([this.contract.mintPrice(),this.contract.totalSupply(),this.contract.maxSupply()]);return this.mintPrice=e,this.totalSupply=a,this.maxSupply=n,{mintPrice:M(e),totalSupply:a.toString(),maxSupply:n.toString()}}catch(e){throw console.error("Error fetching contract data:",e),e}}async mint(e=1){if(!this.contract)throw new Error("Contract not initialized");try{if(await this.contract.hasMinted(p.getAccount()))throw new Error("You have already minted your membership card");const i=await this.contract.mint.estimateGas()*110n/100n,o=await(await this.contract.mint({gasLimit:i})).wait(),d=o.logs.find(u=>u.topics[0]===U("Mint(address,uint256)"));let m=null;return d&&(m=z(d.topics[2]).toString()),{transactionHash:o.hash,tokenId:m,status:o.status===1?"success":"failed"}}catch(a){throw console.error("Error minting NFT:",a),a}}async checkAvailability(){(!this.totalSupply||!this.maxSupply)&&await this.fetchContractData();const e=this.maxSupply-this.totalSupply;return{available:e>0n,remaining:e.toString(),soldOut:e===0n}}getMintPrice(){return this.mintPrice?M(this.mintPrice):null}getContractInfo(){return{address:E,mintPrice:this.mintPrice?M(this.mintPrice):null,totalSupply:this.totalSupply?this.totalSupply.toString():null,maxSupply:this.maxSupply?this.maxSupply.toString():null}}}const I=new H,g="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjQwIiBmaWxsPSIjNjY3ZWVhIi8+PHBhdGggZD0iTTEwMCwxMzBjLTQwLDAuNS04MCwyMC04MCw1MHYyMGgxNjB2LTIwQzE4MCwxNTAsMTQwLDEzMC41LDEwMCwxMzB6IiBmaWxsPSIjNjY3ZWVhIi8+PC9zdmc+";async function P(t,e={}){const{maxWidth:a=200,maxHeight:n=200,quality:i=.8}=e;return new Promise((s,o)=>{const d=new FileReader;d.onload=m=>{const u=new Image;u.onload=()=>{const l=document.createElement("canvas"),v=l.getContext("2d");let h=u.width,y=u.height;h>y?h>a&&(y=Math.round(y*a/h),h=a):y>n&&(h=Math.round(h*n/y),y=n),l.width=h,l.height=y,v.drawImage(u,0,0,h,y);const F=l.toDataURL("image/jpeg",i);s(F)},u.onerror=()=>{o(new Error("Failed to load image"))},u.src=m.target.result},d.onerror=()=>{o(new Error("Failed to read file"))},d.readAsDataURL(t)})}function D(t,e={}){const{maxSizeMB:a=2,allowedTypes:n=["image/jpeg","image/jpg","image/png","image/gif","image/webp"]}=e;if(!n.includes(t.type))return{valid:!1,error:`Invalid file type. Allowed types: ${n.join(", ")}`};const i=a*1024*1024;return t.size>i?{valid:!1,error:`File size too large. Maximum size: ${a}MB`}:{valid:!0}}function S(t){const a=(t.split(",")[1]||t).length*3/4;return Math.round(a/1024)}class W{constructor(){this.contract=null,this.currentUserInfo=null}async initialize(){p.getProvider();const e=p.getSigner();if(!e)throw new Error("No wallet connected");this.contract=new T(E,C,e)}async getUserInfo(e=null){this.contract||await this.initialize();const a=e||p.getAccount();if(!a)throw new Error("No address provided");try{const[n,i,s]=await this.contract.getUserInfo(a);return this.currentUserInfo={memberName:n,discordId:i,avatarImage:s||g,address:a},this.currentUserInfo}catch(n){throw console.error("Error fetching user info:",n),new Error("Failed to fetch user information")}}async setUserInfo({memberName:e,discordId:a,avatarImage:n}){if(this.contract||await this.initialize(),!await this.contract.hasMinted(p.getAccount()))throw new Error("You must mint a membership card first");if(!e||e.trim().length===0)throw new Error("Member name is required");if(!a||a.trim().length===0)throw new Error("Discord ID is required");const s=n||"";if(s&&s!==g){const o=S(s);if(o>100)throw new Error(`Avatar image too large (${o}KB). Maximum size: 100KB`)}try{const d=await(await this.contract.setUserInfo(e.trim(),a.trim(),s)).wait();return this.currentUserInfo={memberName:e.trim(),discordId:a.trim(),avatarImage:s||g,address:p.getAccount()},d}catch(o){throw console.error("Error setting user info:",o),o.message.includes("user rejected")?new Error("Transaction cancelled by user"):new Error("Failed to update user information")}}async processAvatarImage(e){const a=D(e,{maxSizeMB:1,allowedTypes:["image/jpeg","image/jpg","image/png","image/webp"]});if(!a.valid)throw new Error(a.error);const n=await P(e,{maxWidth:200,maxHeight:200,quality:.7}),i=S(n);if(i>100)throw new Error(`Processed image still too large (${i}KB). Try a simpler image.`);return n}createProfileUI(){const e=document.createElement("div");return e.className="user-profile-container",e.innerHTML=`
      <div class="profile-header">
        <h3>Member Profile</h3>
        <p class="profile-subtitle">Update your membership information</p>
      </div>
      
      <div class="profile-form">
        <div class="avatar-section">
          <div class="avatar-preview" id="avatarPreview">
            <img src="${g}" alt="Avatar preview" />
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
    `,this.attachEventListeners(e),e}attachEventListeners(e){const a=e.querySelector("#avatarInput"),n=e.querySelector("#uploadButton"),i=e.querySelector("#removeButton"),s=e.querySelector("#avatarPreview img"),o=e.querySelector("#saveProfile"),d=e.querySelector("#loadProfile"),m=e.querySelector("#profileMessage");let u=null;n.addEventListener("click",()=>{a.click()}),a.addEventListener("change",async l=>{const v=l.target.files[0];if(v)try{m.style.display="none",n.disabled=!0,n.textContent="Processing...",u=await this.processAvatarImage(v),s.src=u,i.style.display="inline-block",n.textContent="Change Avatar"}catch(h){this.showMessage(m,h.message,"error"),n.textContent="Choose Avatar"}finally{n.disabled=!1}}),i.addEventListener("click",()=>{u=null,s.src=g,a.value="",i.style.display="none"}),o.addEventListener("click",async()=>{const l=e.querySelector("#memberName").value,v=e.querySelector("#discordId").value;try{m.style.display="none",o.disabled=!0,o.innerHTML='<span class="loading"></span>Saving...',await this.setUserInfo({memberName:l,discordId:v,avatarImage:u}),this.showMessage(m,"Profile updated successfully!","success")}catch(h){this.showMessage(m,h.message,"error")}finally{o.disabled=!1,o.textContent="Save Profile"}}),d.addEventListener("click",async()=>{try{m.style.display="none",d.disabled=!0,d.innerHTML='<span class="loading"></span>Loading...';const l=await this.getUserInfo();e.querySelector("#memberName").value=l.memberName||"",e.querySelector("#discordId").value=l.discordId||"",s.src=l.avatarImage||g,l.avatarImage&&l.avatarImage!==g&&(u=l.avatarImage,i.style.display="inline-block"),this.showMessage(m,"Profile loaded successfully!","success")}catch(l){this.showMessage(m,l.message,"error")}finally{d.disabled=!1,d.textContent="Refresh"}})}showMessage(e,a,n){e.textContent=a,e.className=`message ${n}`,e.style.display="block",n==="success"&&setTimeout(()=>{e.style.display="none"},5e3)}}const w=new W,O=document.querySelector("#app");let r={isConnected:!1,isLoading:!1,mintQuantity:1,message:null,contractInfo:null,hasMinted:!1,profileElement:null,mintFormData:{memberName:"",discordId:"",avatarImage:null,avatarPreview:null}};function c(t){r={...r,...t},B()}function f(t,e="info"){c({message:{text:t,type:e}}),e!=="error"&&setTimeout(()=>c({message:null}),5e3)}async function A(){c({isLoading:!0,message:null});try{const t=await p.connect();c({isConnected:!0,isLoading:!1}),f("Wallet connected successfully!","success"),N()}catch(t){console.error("Connection error:",t),c({isLoading:!1}),f(t.message||"Failed to connect wallet","error")}}async function N(){try{await I.initialize();const t=await I.fetchContractData(),e=p.getAccount(),a=await I.contract.hasMinted(e);let n=null;if(a&&!r.profileElement){await w.initialize(),n=w.createProfileUI();try{await w.getUserInfo();const i=w.currentUserInfo;i&&(n.querySelector("#memberName").value=i.memberName||"",n.querySelector("#discordId").value=i.discordId||"",i.avatarImage&&i.avatarImage!==g&&(n.querySelector("#avatarPreview img").src=i.avatarImage,n.querySelector("#removeButton").style.display="inline-block"))}catch{console.log("No existing profile data")}}c({contractInfo:t,hasMinted:a,profileElement:n})}catch(t){console.error("Failed to load contract info:",t),f("Failed to load NFT contract information","error")}}async function K(){p.disconnect(),c({isConnected:!1,contractInfo:null,message:null,hasMinted:!1,profileElement:null})}async function R(){if(!r.mintFormData.memberName.trim()){f("Please enter your member name","error");return}if(!r.mintFormData.discordId.trim()){f("Please enter your Discord ID","error");return}c({isLoading:!0,message:null});try{f("Transaction pending...","info");const t=await I.mint(1);f("Membership card minted! Setting up your profile...","info"),await w.initialize(),await w.setUserInfo({memberName:r.mintFormData.memberName.trim(),discordId:r.mintFormData.discordId.trim(),avatarImage:r.mintFormData.avatarImage||""}),c({isLoading:!1});const e=q(t.transactionHash),a=e?`Membership card minted and profile set! <a href="${e}" target="_blank" class="transaction-link">View transaction</a>`:`Membership card minted and profile set! Transaction: ${t.transactionHash}`;f(a,"success"),c({mintFormData:{memberName:"",discordId:"",avatarImage:null,avatarPreview:null}}),await N()}catch(t){console.error("Minting error:",t),c({isLoading:!1});let e="Failed to mint membership card";t.message.includes("already minted")?e="You have already minted your membership card":t.message.includes("insufficient funds")?e="Insufficient funds for gas fees":t.message.includes("user rejected")&&(e="Transaction cancelled by user"),f(e,"error")}}function Q(t){const e=Math.max(1,Math.min(10,r.mintQuantity+t));c({mintQuantity:e})}function B(){if(O.innerHTML=`
    <div class="header">
      <h1>BizenDao Members Card</h1>
      <p class="subtitle">Mint your membership SBT directly from mobile browser</p>
      <p class="dev-notice">🛠️ Development Mode - Private Chain</p>
    </div>

    ${r.message?`
      <div class="message ${r.message.type}">
        ${r.message.text}
      </div>
    `:""}

    <div class="wallet-section">
      ${r.isConnected?`
        <div class="wallet-info">
          <span class="wallet-address">${p.formatAddress(p.getAccount())}</span>
        </div>
        <button class="secondary" onclick="window.app.disconnectWallet()" ${r.isLoading?"disabled":""}>
          Disconnect
        </button>
      `:`
        <button onclick="window.app.connectWallet()" ${r.isLoading?"disabled":""}>
          ${r.isLoading?'<span class="loading"></span>Connecting...':"Connect Wallet"}
        </button>
      `}
    </div>

    ${r.isConnected?`
      ${r.hasMinted?"":`
        <div class="mint-section">
          ${r.contractInfo?`
            <div class="contract-info">
              <div class="info-item">
                <div class="info-label">Price</div>
                <div class="info-value">FREE</div>
              </div>
              <div class="info-item">
                <div class="info-label">Minted</div>
                <div class="info-value">${r.contractInfo.totalSupply}/${r.contractInfo.maxSupply}</div>
              </div>
            </div>

            <div class="mint-controls">
              <div class="sbt-info">
                <p class="sbt-notice">🎫 One membership card per wallet</p>
                <p class="sbt-notice">💎 Soul Bound Token (Non-transferable)</p>
                <p class="sbt-notice">🆓 Free mint (gas only)</p>
              </div>

              <div class="mint-form">
                <h3>Member Information</h3>
                
                <div class="form-group">
                  <label for="mintMemberName">Member Name *</label>
                  <input 
                    type="text" 
                    id="mintMemberName" 
                    placeholder="Enter your name" 
                    maxlength="50"
                    value="${r.mintFormData.memberName}"
                    onchange="window.app.updateMintForm('memberName', this.value)"
                    ${r.isLoading?"disabled":""}
                  />
                </div>
                
                <div class="form-group">
                  <label for="mintDiscordId">Discord ID *</label>
                  <input 
                    type="text" 
                    id="mintDiscordId" 
                    placeholder="username#1234" 
                    maxlength="50"
                    value="${r.mintFormData.discordId}"
                    onchange="window.app.updateMintForm('discordId', this.value)"
                    ${r.isLoading?"disabled":""}
                  />
                </div>
                
                <div class="form-group">
                  <label>Avatar Image (Optional)</label>
                  <div class="avatar-upload-section">
                    ${r.mintFormData.avatarPreview?`
                      <div class="avatar-preview-mint">
                        <img src="${r.mintFormData.avatarPreview}" alt="Avatar preview" />
                        <button class="remove-avatar" onclick="window.app.removeAvatar()" ${r.isLoading?"disabled":""}>×</button>
                      </div>
                    `:`
                      <div class="avatar-placeholder">
                        <img src="${g}" alt="Default avatar" />
                      </div>
                    `}
                    <div class="avatar-upload-controls">
                      <input type="file" id="mintAvatarInput" accept="image/*" style="display: none;" onchange="window.app.handleAvatarUpload(event)" />
                      <button class="secondary small" onclick="document.getElementById('mintAvatarInput').click()" ${r.isLoading?"disabled":""}>
                        ${r.mintFormData.avatarPreview?"Change Avatar":"Choose Avatar"}
                      </button>
                      <p class="avatar-info">Max 200x200px, 100KB</p>
                    </div>
                  </div>
                </div>

                <button onclick="window.app.mintNFT()" ${r.isLoading?"disabled":""} class="mint-button">
                  ${r.isLoading?'<span class="loading"></span>Minting...':"Mint Membership Card"}
                </button>
              </div>
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
  `,r.profileElement&&r.hasMinted){const t=document.getElementById("profileContainer");t&&t.appendChild(r.profileElement)}}async function V(t){const e=t.target.files[0];if(e)try{const a=D(e,{maxSizeMB:1,allowedTypes:["image/jpeg","image/jpg","image/png","image/webp"]});if(!a.valid){f(a.error,"error");return}const n=await P(e,{maxWidth:200,maxHeight:200,quality:.7}),i=S(n);if(i>100){f(`Image too large (${i}KB). Maximum: 100KB`,"error");return}c({mintFormData:{...r.mintFormData,avatarImage:n,avatarPreview:n}})}catch{f("Failed to process image","error")}}function Z(t,e){c({mintFormData:{...r.mintFormData,[t]:e}})}function Y(){c({mintFormData:{...r.mintFormData,avatarImage:null,avatarPreview:null}});const t=document.getElementById("mintAvatarInput");t&&(t.value="")}window.app={connectWallet:A,disconnectWallet:K,mintNFT:R,updateQuantity:Q,handleAvatarUpload:V,updateMintForm:Z,removeAvatar:Y};B();typeof window.ethereum<"u"&&window.ethereum.request({method:"eth_accounts"}).then(t=>{t.length>0&&A()});
