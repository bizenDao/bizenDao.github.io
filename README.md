# BizenDao NFT Mint App

スマートフォンから簡単にNFTをミントできるWebアプリケーション

## 🌐 デモ

[https://bizendao.github.io/](https://bizendao.github.io/)

## 📱 特徴

- **モバイルファースト**: スマートフォンの標準ブラウザから直接NFTをミント可能
- **MetaMask SDK統合**: シームレスなウォレット接続体験
- **レスポンシブデザイン**: あらゆるデバイスで最適な表示
- **リアルタイム情報**: ミント価格と在庫状況をリアルタイムで表示
- **複数ミント対応**: 1回のトランザクションで複数のNFTをミント可能

## 🛠 技術スタック

- **フロントエンド**: Vite + Vanilla JavaScript
- **ブロックチェーン**: Ethereum / EVM互換チェーン
- **ウォレット接続**: MetaMask SDK
- **スマートコントラクト**: ethers.js
- **デプロイ**: GitHub Pages

## 🚀 クイックスタート

### 前提条件

- Node.js (v16以上)
- npm または yarn
- MetaMaskアプリ（モバイル）またはブラウザ拡張機能（デスクトップ）

### ローカル開発

```bash
# リポジトリのクローン
git clone https://github.com/bizenDao/bizenDao.github.io.git
cd bizenDao.github.io/nft-mint-app

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 設定

1. `nft-mint-app/src/contract.js`を編集して、NFTコントラクト情報を設定：

```javascript
export const NFT_CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS';
export const CHAIN_CONFIG = {
  chainId: '0x1', // 使用するチェーンID
  // ...
};
```

## 📂 プロジェクト構造

```
bizenDao.github.io/
├── index.html          # 本番環境用HTML
├── assets/             # ビルド済みアセット
│   └── logo.jpg        # favicon・OGP画像
├── docs/               # ドキュメント
│   ├── DEPLOYMENT.md   # デプロイ手順
│   └── NFT_MINT_APP.md # アプリ詳細
└── nft-mint-app/       # ソースコード
    ├── src/
    │   ├── contract.js # コントラクト設定
    │   ├── wallet.js   # ウォレット接続
    │   ├── mint.js     # NFTミント機能
    │   ├── main.js     # メインアプリ
    │   └── style.css   # スタイル
    └── vite.config.js  # ビルド設定
```

## 🔧 主要な機能

### ウォレット接続
- MetaMask SDKを使用した安全な接続
- モバイルブラウザからのディープリンク対応
- 自動的なチェーン切り替え

### NFTミント
- ERC721標準に準拠
- ガス見積もりと最適化
- トランザクション状態のリアルタイム追跡
- エラーハンドリングとユーザーフィードバック

### UI/UX
- モバイル最適化されたタッチフレンドリーなインターフェース
- ダークモード/ライトモード自動切り替え
- プログレッシブウェブアプリ（PWA）対応

## 📝 デプロイ

詳細な手順は[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)を参照してください。

### クイックデプロイ

```bash
# nft-mint-appディレクトリで実行
npm run build

# リポジトリルートで実行
cp -r nft-mint-app/dist/* .
git add -A
git commit -m "Deploy updates"
git push origin main
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🔗 関連リンク

- [BizenDao公式サイト](https://bizendao.github.io/)
- [ドキュメント](docs/)
- [問題報告](https://github.com/bizenDao/bizenDao.github.io/issues)

## 👥 BizenDao Community

BizenDao - 陶芸家のためのコミュニティ

---

Built with ❤️ by BizenDao Community