# スマートコントラクトデプロイガイド（REMIX）

このガイドでは、REMIX IDEを使用してNFTスマートコントラクトをPolygon Mainnetにデプロイする方法を説明します。

## 前提条件

- MetaMaskウォレット
- Polygon MainnetのMATICトークン（ガス代用）
- NFTスマートコントラクトのソースコード

## 手順

### 1. REMIX IDEへのアクセス

1. ブラウザで[REMIX IDE](https://remix.ethereum.org)にアクセス
2. 新しいファイルを作成（例：`MyNFT.sol`）

### 2. スマートコントラクトの作成

以下は基本的なNFTコントラクトの例です：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    uint256 public mintPrice = 0.01 ether; // 0.01 MATIC
    uint256 public maxSupply = 10000;
    
    constructor() ERC721("MyNFT", "MNFT") {}
    
    function mint(address to) public payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
```

### 3. コンパイル

1. 左側のメニューから「Solidity Compiler」を選択
2. コンパイラバージョンを選択（0.8.0以上を推奨）
3. 「Compile」ボタンをクリック

### 4. MetaMaskの設定

1. MetaMaskを開く
2. ネットワークをPolygon Mainnetに切り替え
   - ネットワーク名: Polygon Mainnet
   - RPC URL: https://polygon-rpc.com/
   - チェーンID: 137
   - 通貨記号: MATIC
   - ブロックエクスプローラーURL: https://polygonscan.com/

### 5. デプロイ

1. 左側のメニューから「Deploy & Run Transactions」を選択
2. Environmentを「Injected Provider - MetaMask」に設定
3. アカウントがPolygon Mainnetに接続されていることを確認
4. 「Deploy」ボタンをクリック
5. MetaMaskでトランザクションを承認

### 6. コントラクトアドレスの取得

1. デプロイが完了すると、REMIXの下部にコントラクトアドレスが表示されます
2. このアドレスをコピーして保存

### 7. アプリケーションへの設定

1. `nft-mint-app/src/contract.js`を開く
2. `NFT_CONTRACT_ADDRESS`にデプロイしたコントラクトアドレスを設定：

```javascript
export const NFT_CONTRACT_ADDRESS = '0x...(デプロイしたアドレス)';
```

3. 必要に応じてABIも更新（REMIXのArtifactsタブから取得可能）

## トラブルシューティング

### ガス代が高い場合

- Polygon Mainnetのガストラッカーで現在のガス価格を確認
- 混雑していない時間帯にデプロイを実行

### トランザクションが失敗する場合

1. MetaMaskのネットワークがPolygon Mainnetになっているか確認
2. 十分なMATICがウォレットにあるか確認
3. ガスリミットを手動で増やしてみる

### コントラクトが表示されない場合

1. Polygonscanでトランザクションハッシュを検索
2. コントラクトが正常にデプロイされているか確認
3. REMIXのコンソールでエラーメッセージを確認

## セキュリティ考慮事項

- 本番環境にデプロイする前に、必ずテストネット（Mumbai）でテストを実施
- コントラクトのオーナー権限を適切に管理
- 重要な関数には適切なアクセス制御を実装

## 参考リンク

- [REMIX IDE](https://remix.ethereum.org)
- [Polygon Documentation](https://docs.polygon.technology/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Polygonscan](https://polygonscan.com/)