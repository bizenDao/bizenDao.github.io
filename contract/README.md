# BizenDao Members SBT Contract

## 概要

BizenDao Members SBTは、BizenDaoのメンバーシップカードとして機能するSoul Bound Token（譲渡不可能なNFT）です。

## 特徴

- **無料ミント**: ガス代のみでミント可能（ミント手数料なし）
- **1アカウント1枚限定**: 各アドレスは1つのSBTのみ保有可能
- **譲渡不可（Soul Bound）**: トークンの譲渡・売買は不可能
- **オーナー権限でのBURN**: コントラクトオーナーのみがトークンをBURN可能

## コントラクト仕様

### 基本情報
- **名前**: BizenDao Members Card
- **シンボル**: BIZSBT
- **規格**: ERC721準拠（転送機能を無効化）
- **Solidity バージョン**: ^0.8.19

### 主な関数

#### ユーザー向け関数

```solidity
// SBTをミント（無料、1回のみ）
function mint() external

// アドレスの保有トークン数を確認（0または1）
function balanceOf(address account) external view returns (uint256)

// トークンIDの所有者を確認
function ownerOf(uint256 tokenId) external view returns (address)

// アドレスが保有するトークンIDを確認
function tokenOfOwner(address account) external view returns (uint256)

// アドレスがミント済みか確認
function hasMinted(address account) external view returns (bool)
```

#### オーナー向け関数

```solidity
// 特定のトークンをBURN
function burn(uint256 tokenId) external onlyOwner

// コントラクトの所有権を移転
function transferOwnership(address newOwner) external onlyOwner
```

#### その他の関数

```solidity
// ミント価格を取得（常に0）
function mintPrice() external pure returns (uint256)

// 最大供給量を取得（無制限）
function maxSupply() external pure returns (uint256)

// 総供給量を取得
function totalSupply() external view returns (uint256)
```

### 無効化された関数

以下の転送・承認関連の関数は、SBTの性質上すべて無効化されています：
- `transferFrom`
- `safeTransferFrom`
- `approve`
- `setApprovalForAll`
- `getApproved`
- `isApprovedForAll`

## デプロイ手順

### 1. REMIXでのデプロイ

1. [REMIX IDE](https://remix.ethereum.org)にアクセス
2. `BizenDaoMembersSBT.sol`をコピー
3. コンパイラバージョンを`0.8.19`以上に設定
4. コンパイル実行
5. MetaMaskで対象ネットワークに接続
6. デプロイ実行

### 2. デプロイ後の設定

デプロイ後、コントラクトアドレスを`nft-mint-app/src/contract.js`または`.env`ファイルに設定：

```javascript
// 開発環境の場合
VITE_CONTRACT_ADDRESS=0x... // デプロイしたアドレス
```

## 使用例

### ミント
```javascript
// Web3.js/Ethers.jsを使用
await contract.mint();
```

### 保有確認
```javascript
// アドレスがSBTを保有しているか確認
const hasSBT = await contract.hasMinted(userAddress);
const balance = await contract.balanceOf(userAddress);
const tokenId = await contract.tokenOfOwner(userAddress);
```

### BURN（オーナーのみ）
```javascript
// 特定のトークンをBURN
await contract.burn(tokenId);
```

## セキュリティ考慮事項

1. **オーナー権限**: オーナーアドレスは安全に管理してください
2. **BURN機能**: 誤ってBURNしないよう注意が必要です
3. **再ミント不可**: 一度BURNされたアドレスは再度ミントできません

## ライセンス

MIT License