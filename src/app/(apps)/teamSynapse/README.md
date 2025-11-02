# Team Synapse

Google Workspace環境（Gmail, Google Drive, Google Chat）におけるコミュニケーション履歴をAIで横断的に分析するWebアプリケーションです。

## 概要

特定の人物（例：部下）とのコミュニケーション履歴を分析し、関係構築、業務推進、タスクの抜け漏れ防止に役立つ「客観的な気づき」と「具体的なネクストアクション」を提案します。

## 主な機能

- **Gmail分析**: 特定の相手とのメールのやり取りを収集・分析
- **Google Chat分析**: Chatルームでの会話履歴を分析（ボット招待が必要）
- **Google Drive連携**: Gmail添付のDocs/Slideファイルのテキスト抽出（将来実装）
- **AI分析**: Gemini APIによる3ステップ分析
  1. 観点提案（注目すべきトピックの抽出）
  2. 事実分析（各観点における具体的な事実の抽出）
  3. 行動提案（具体的なネクストアクションの提案）

## セットアップ

### 1. Google Cloud Platformの設定

1. [Google Cloud Console](https://console.cloud.google.com)にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「ライブラリ」から以下のAPIを有効化:
   - Gmail API
   - Google Drive API
   - Google Chat API
4. 「APIとサービス」→「認証情報」からOAuth 2.0クライアントIDを作成:
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みのJavaScript生成元: `http://localhost:3000`（開発環境）
   - 承認済みのリダイレクトURI: `http://localhost:3000`
5. クライアントIDをコピー

### 2. Google Chat Botの設定（Chat分析を使う場合）

1. Google Cloud Consoleで「Google Chat API」の「構成」画面を開く
2. ボット名（例: "Analyzer Bot"）、アバターを設定
3. 組織内に公開
4. **重要**: 分析対象のChatルームに、このボットを手動で招待する必要があります

### 3. 環境変数の設定

```bash
# .env.exampleを.env.localにコピー
cp .env.example .env.local

# .env.localを編集し、Google Client IDを設定
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 4. Gemini API Keyの取得

1. [Google AI Studio](https://aistudio.google.com/)にアクセス
2. APIキーを生成
3. アプリケーション内で入力して使用

## 使用方法

1. アプリケーションにアクセス
2. 「Googleアカウントで認証」ボタンをクリック
3. Gmail、Drive、Chatの読み取り権限を承認
4. 分析設定を入力:
   - 対象メールアドレス（複数可、カンマ区切り）
   - 期間（開始日・終了日）
   - Google Chat ルームID（任意）
   - Gemini API Key
5. 「分析実行」ボタンをクリック
6. 分析結果が表示されます

## ディレクトリ構成

```
src/app/(apps)/team-synapse/
├── (builders)/
│   └── PageBuilder.tsx          # メインページコンポーネント
├── components/
│   ├── AuthButton.tsx           # 認証ボタン
│   ├── InputForm.tsx            # 入力フォーム
│   └── ResultDisplay.tsx        # 結果表示
├── hooks/
│   └── useGoogleAuth.ts         # Google認証フック
├── lib/
│   ├── google-apis.ts           # Google APIs連携
│   ├── data-collector.ts        # データ収集・整形
│   └── ai-analyzer.ts           # AI分析ロジック
├── types/
│   └── index.ts                 # 型定義
├── page.tsx                     # ルートページ
├── .env.example                 # 環境変数テンプレート
├── requirement.md               # 要件定義書
└── README.md                    # このファイル
```

## 注意事項

### Google Chat API使用の前提条件

Chat分析機能は、以下の条件が満たされない限り動作しません:

1. **GCPでのChatアプリ（ボット）構成**: 開発者がGCPでボットを定義
2. **ユーザーによるボット招待**: 分析対象の各Chatルームに、ボットを手動で招待

ボットが招待されていないルームの履歴は、適切な権限があっても取得できません。

### セキュリティ

- このアプリケーションはクライアントサイドで完結します
- データはブラウザ内でのみ処理され、サーバーには保存されません
- API Keyはセッション中のみメモリに保持され、永続化されません

## 技術スタック

- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **認証**: Google Identity Services (OAuth 2.0)
- **API**:
  - Gmail API (v1)
  - Google Drive API (v3)
  - Google Chat API (v1)
  - Gemini API (gemini-2.0-flash-exp)

## ライセンス

このプロジェクトは社内ツールとして開発されています。

