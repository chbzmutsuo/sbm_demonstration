# 環境変数のセットアップ

## 必要な環境変数

プロジェクトルートの `.env.local` ファイルに以下の環境変数を追加してください。

```env
# Google OAuth 2.0 Client ID
# Google Cloud Consoleで取得したクライアントID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Gemini API Key
# Google AI Studioで取得したAPI Key
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
```

## セットアップ手順

### 1. Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）

### 2. 必要なAPIを有効化

「APIとサービス」→「ライブラリ」から以下のAPIを有効化:

- **Gmail API**
- **Google Drive API**
- **Google Chat API**

### 3. OAuth 2.0 認証情報の作成

1. 「APIとサービス」→「認証情報」を開く
2. 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
3. アプリケーションの種類: **ウェブアプリケーション**
4. 名前: 任意（例: Team Synapse）
5. **承認済みのJavaScript生成元** に以下を追加:
   - 開発環境: `http://localhost:3000`
   - 本番環境: `https://your-domain.com`
6. **承認済みのリダイレクトURI** に以下を追加:
   - 開発環境: `http://localhost:3000`
   - 本番環境: `https://your-domain.com`
7. 「作成」をクリック
8. 表示されたクライアントIDをコピー

### 4. .env.localファイルの作成

プロジェクトルート（`/Users/mutsuo/.cursor/worktrees/01_KMKM/C3vsU/`）に `.env.local` ファイルを作成し、以下を記述:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=【コピーしたクライアントID】
```

### 5. Google Chat Botの設定（Chat分析を使う場合）

1. Google Cloud Consoleで「Google Chat API」を開く
2. 「構成」タブを選択
3. ボット名を入力（例: "Analyzer Bot"）
4. アバター画像をアップロード（任意）
5. 説明を入力（例: "コミュニケーション分析ボット"）
6. 機能: **DM受信** と **スペース参加** を有効化
7. 権限: **特定のユーザーとスペース** を選択
8. 「保存」をクリック

### 6. Chatルームへのボット招待（重要）

Chat分析を使用するには、分析対象の各Chatルームに上記で作成したボットを招待する必要があります:

1. 分析対象のChatルームを開く
2. メンバー追加アイコンをクリック
3. 作成したボット名（例: "Analyzer Bot"）を検索
4. ボットを追加

**注意**: ボットが招待されていないルームの履歴は、適切な権限があっても取得できません。

### 7. Gemini API Keyの取得と設定

1. [Google AI Studio](https://aistudio.google.com/) にアクセス
2. 「Get API Key」をクリック
3. APIキーを生成（既存のGCPプロジェクトまたは新規プロジェクト）
4. APIキーをコピー
5. `.env.local` ファイルに追加:

```env
NEXT_PUBLIC_GEMINI_API_KEY=【コピーしたAPIキー】
```

**重要**: `.env.local` ファイルはGitにコミットしないでください（.gitignoreに含まれています）。

## トラブルシューティング

### 認証エラーが発生する場合

- Google Cloud Consoleで「承認済みのJavaScript生成元」が正しく設定されているか確認
- ブラウザのキャッシュをクリア
- シークレットモードで試す

### Chat APIでデータが取得できない場合

- ボットがChatルームに招待されているか確認
- Google Chat APIが有効化されているか確認
- ルームIDが正しいか確認（`spaces/AAAAxxxxxxx` 形式）

### Gmail/Drive APIでデータが取得できない場合

- 対象のメールアドレスが正しいか確認
- 日付範囲が適切か確認
- APIの有効化とスコープの承認を確認

