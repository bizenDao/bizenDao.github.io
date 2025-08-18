import { walletManager } from "../wallet";
import { AddressDisplay } from "./AddressDisplay";
import {
  shouldShowMetaMaskRedirect,
  openInMetaMask,
} from "../utils/detectBrowser";

export class Header {
  constructor() {
    this.isConnected = false;
    this.isLoading = false;
    this.account = null;
  }

  async checkConnection() {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        await this.connectWallet();
      }
    }
  }

  async connectWallet() {
    this.isLoading = true;
    this.render();

    try {
      const account = await walletManager.connect();
      this.isConnected = true;
      this.account = account;
      this.isLoading = false;
      this.render();

      // 接続成功を通知
      window.dispatchEvent(
        new CustomEvent("walletConnected", { detail: { account } })
      );
    } catch (error) {
      console.error("Connection error:", error);
      this.isLoading = false;
      this.render();

      // エラーを通知
      window.dispatchEvent(
        new CustomEvent("walletError", { detail: { error: error.message } })
      );
    }
  }

  async disconnectWallet() {
    walletManager.disconnect();
    this.isConnected = false;
    this.account = null;
    this.render();

    // 切断を通知
    window.dispatchEvent(new CustomEvent("walletDisconnected"));
  }

  toggleDropdown() {
    const dropdown = document.querySelector(".wallet-dropdown");
    if (dropdown) {
      dropdown.classList.toggle("show");
    }
  }

  render() {
    const headerEl = document.getElementById("app-header");
    if (!headerEl) return;

    // モバイルでMetaMask WebView外からのアクセスかチェック
    const showMetaMaskRedirect = shouldShowMetaMaskRedirect();

    headerEl.innerHTML = `
      <div class="header-container">
        <div class="header-logo">
          <h1>BizenDao</h1>
        </div>

        <div class="wallet-container">
          ${
            showMetaMaskRedirect
              ? `
            <button class="wallet-button metamask-icon-only" onclick="window.header.openInMetaMask()" title="MetaMaskで開く">
              <svg width="32" height="32" viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg">
                <path fill="#E2761B" stroke="#E2761B" stroke-linecap="round" stroke-linejoin="round" d="M274.1 35.5l-99.5 73.9L193 65.8z"></path>
                <path fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round" d="M44.4 35.5l98.7 74.6-17.5-44.3zm193.9 171.3l-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z"></path>
                <path fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round" d="M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5zm111.3 0l-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5l33.9 16.5-4.7-39.3z"></path>
                <path fill="#C0AD9E" stroke="#C0AD9E" stroke-linecap="round" stroke-linejoin="round" d="M211.8 247.4l-33.9-16.5 2.7 22.1-.3 9.3zm-105 0l31.5 14.9-.2-9.3 2.5-22.1z"></path>
                <path fill="#233447" stroke="#233447" stroke-linecap="round" stroke-linejoin="round" d="M138.8 193.5l-28.2-8.3 19.9-9.1zm40.9 0l8.3-17.4 20 9.1z"></path>
                <path fill="#CD6116" stroke="#CD6116" stroke-linecap="round" stroke-linejoin="round" d="M106.8 247.4l4.8-40.6-31.3.9zM207 206.8l4.8 40.6 26.5-39.7zm23.8-44.7l-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-120.2 23.1l20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z"></path>
                <path fill="#E4751F" stroke="#E4751F" stroke-linecap="round" stroke-linejoin="round" d="M87.8 162.1l23.6 46-.8-22.9zm120.3 23.1l-1 22.9 23.7-46zm-64-20.6l-5.3 28.9 6.6 34.1 1.5-44.9zm30.5 0l-2.7 18 1.2 45 6.7-34.1z"></path>
                <path fill="#F6851B" stroke="#F6851B" stroke-linecap="round" stroke-linejoin="round" d="M179.8 193.5l-6.7 34.1 4.8 3.3 29.2-22.8 1-22.9zm-69.2-8.3l.8 22.9 29.2 22.8 4.8-3.3-6.6-34.1z"></path>
                <path fill="#B09D9E" stroke="#B09D9E" stroke-linecap="round" stroke-linejoin="round" d="M180.3 262.3l.3-9.3-2.5-2.2h-37.7l-2.3 2.2.2 9.3-31.5-14.9 11 9 22.3 15.5h38.3l22.4-15.5 11-9z"></path>
                <path fill="#333333" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" d="M177.9 230.9l-4.8-3.3h-27.7l-4.8 3.3-2.5 22.1 2.3-2.2h37.7l2.5 2.2z"></path>
                <path fill="#C0AD9E" stroke="#C0AD9E" stroke-linecap="round" stroke-linejoin="round" d="M278.3 114.2l8.5-40.8-12.7-37.9-96.2 71.4 37 31.3 52.3 15.3 11.6-13.5-5-3.6 8-7.3-6.2-4.8 8-6.1zM31.8 73.4l8.5 40.8-5.4 4 8 6.1-6.1 4.8 8 7.3-5 3.6 11.5 13.5 52.3-15.3 37-31.3L44.4 35.5z"></path>
                <path fill="#BC6116" stroke="#BC6116" stroke-linecap="round" stroke-linejoin="round" d="M267.2 153.5l-52.3-15.3 15.9 23.9-23.7 46 31.2-.4h46.5zm-163.6-15.3l-52.3 15.3-17.4 54.2h46.4l31.1.4-23.6-46zm71 26.4l3.3-57.7 15.2-41.1h-67.5l15 41.1 3.5 57.7 1.2 18.2.1 44.8h27.7l.2-44.8z"></path>
              </svg>
            </button>
          `
              : this.isConnected
              ? `
            <button class="wallet-button connected" onclick="window.header.toggleDropdown()">
              <span class="wallet-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z" fill="currentColor"/>
                </svg>
              </span>
              <span class="wallet-address">${walletManager.formatAddress(
                this.account
              )}</span>
              <span class="connection-status connected"></span>
            </button>
            <div class="wallet-dropdown">
              <div class="dropdown-item">
                <span class="dropdown-label">Connected</span>
                <span class="dropdown-value">${AddressDisplay.render(
                  this.account,
                  { showCopyIcon: true }
                )}</span>
              </div>
              <button class="dropdown-button disconnect" onclick="window.header.disconnectWallet()">
                Disconnect
              </button>
            </div>
          `
              : `
            <button class="wallet-button disconnected" onclick="window.header.connectWallet()" ${
              this.isLoading ? "disabled" : ""
            }>
              ${
                this.isLoading
                  ? `
                <span class="loading-spinner"></span>
                <span>Connecting...</span>
              `
                  : `
                <span class="wallet-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z" fill="currentColor"/>
                  </svg>
                </span>
                <span>Connect</span>
                <span class="connection-status disconnected"></span>
              `
              }
            </button>
          `
          }
        </div>
      </div>
    `;

    // クリック外でドロップダウンを閉じる
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".wallet-container")) {
        const dropdown = document.querySelector(".wallet-dropdown");
        if (dropdown) {
          dropdown.classList.remove("show");
        }
      }
    });
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      account: this.account,
    };
  }

  openInMetaMask() {
    openInMetaMask();
  }
}

export const header = new Header();
