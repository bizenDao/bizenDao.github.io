# BizenDao Smart Contracts

BizenDaoで使用されるスマートコントラクト群です。

## コントラクト一覧

### 1. MembersSBT - メンバーシップSBT
- **ディレクトリ**: `./MembersSBT/`
- **説明**: BizenDaoのメンバーシップを証明するSoul Bound Token
- **特徴**:
  - 無料ミント（ガス代のみ）
  - 1アドレス1枚限定
  - 譲渡不可（Soul Bound）
  - プロフィール情報保存機能

### 2. その他のコントラクト（今後追加予定）
- Governance契約
- Treasury契約
- その他のDAO機能

## 開発環境

### デプロイツール
- **REMIX IDE**: すべてのコントラクトはREMIXを使用してデプロイ
- **Hardhat**: 使用禁止（.claude/settings.jsonで制限）

### 対応ネットワーク
- **本番環境**: Polygon (Matic)
- **開発環境**: BizenDao Private Chain
  - RPC: http://dev2.bon-soleil.com/rpc
  - Chain ID: 21201

## ディレクトリ構造
```
contract/
├── README.md                 # このファイル
├── MembersSBT/              # メンバーシップSBT関連
│   ├── BizenDaoMembersSBT.sol
│   ├── IBizenDaoMembersSBT.sol
│   ├── BizenDaoMembersSBT_ABI.json
│   ├── BizenDaoMembersSBT_Interface.md
│   ├── IBizenDaoMembersSBT_Usage.sol
│   └── README.md
└── [今後追加されるコントラクト]/
```

## セキュリティ

- すべてのコントラクトは本番デプロイ前にテストネットで十分にテストしてください
- オーナー権限を持つアドレスは安全に管理してください
- ユーザー情報はブロックチェーン上に公開されるため、個人情報の取り扱いに注意してください

## ライセンス

MIT License