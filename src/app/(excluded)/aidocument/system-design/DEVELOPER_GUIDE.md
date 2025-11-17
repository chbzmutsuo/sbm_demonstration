# 書類管理システム（Aidocument）開発者向け設計書・説明書

## 目次

1. [概要](#概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [データベース設計](#データベース設計)
4. [主要機能](#主要機能)
5. [ディレクトリ構成](#ディレクトリ構成)
6. [技術スタック](#技術スタック)
7. [実装済み機能](#実装済み機能)
8. [未実装機能](#未実装機能)
9. [開発ガイドライン](#開発ガイドライン)
10. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### アプリケーションの目的

本アプリケーションは、**公共工事の書類作成にかかる時間を短縮し、効率化**を図ることを目的としています。

現場ごとに存在する複数のPDFファイルに対して、現場マスタにある情報をドラッグアンドドロップにて簡単に配置できるようにします。同じ現場や類似の案件でもテンプレートは毎回様々なレイアウトになるため、柔軟な配置機能が必要です。

将来的には、テンプレートの情報をAIが理解することで、必要な部品を必要な配置に自動で並べてくれる機能を実装予定です。

### 主要なユーザーストーリー

1. **自社情報管理**: ログインユーザーは自社の情報（企業名、代表者、住所、建設業許可、社会保険情報）を管理できる
2. **取引先管理**: 発注者や下請け会社の情報を管理できる
3. **現場管理**: 工事現場の基本情報、スタッフ、車両、下請負人を管理できる
4. **書類作成**: PDFテンプレートに現場マスタの情報をドラッグ&ドロップで配置し、書類を作成できる
5. **AI自動配置**: PDFテンプレートをAIが解析し、適切な位置に自動で情報を配置できる（将来実装）

---

## アーキテクチャ

### 全体構成

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Pages      │  │  Components  │  │   Actions    │ │
│  │  (Server)    │  │   (Client)   │  │  (Server)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Prisma ORM                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   PostgreSQL │  │     S3       │  │   OpenAI     │ │
│  │   Database   │  │  (PDF保存)   │  │  (AI解析)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### データフロー

1. **データ取得**: Server Component（Page）がServer Actionを呼び出し、Prisma経由でデータベースから取得
2. **データ表示**: Client ComponentがServer Componentからpropsを受け取り、UIに表示
3. **データ更新**: Client ComponentがServer Actionを呼び出し、データベースを更新
4. **ファイルアップロード**: Client ComponentがS3に直接アップロードし、URLをデータベースに保存

---

## データベース設計

### エンティティ関係図

```
AidocumentCompany (企業マスタ)
├── type: 'self' | 'client' | 'subcontractor'
├── SitesAsClient (発注者としての現場)
├── SitesAsCompany (元請けとしての現場)
├── Subcontractors (下請けとしての関係)
└── Users (ユーザー)

AidocumentSite (現場)
├── Client (発注者)
├── Company (元請け)
├── Staff (スタッフ)
├── aidocumentVehicles (車両)
├── Subcontractors (下請負人)
└── Document (書類)

AidocumentDocument (書類)
├── Site (現場)
├── DocumentItem (配置項目)
└── AnalysisCache (AI解析キャッシュ)
```

### 主要モデル

#### AidocumentCompany（企業マスタ）

- **用途**: 自社、発注者、下請け会社の情報を管理
- **主要フィールド**:
  - `type`: 企業種別（'self', 'client', 'subcontractor'）
  - `name`: 企業名
  - `constructionLicense`: 建設業許可情報（JSON配列）
  - `socialInsurance`: 社会保険情報（JSONオブジェクト）

#### AidocumentSite（現場）

- **用途**: 工事現場の基本情報と関連データを管理
- **主要フィールド**:
  - `clientId`: 発注者ID
  - `companyId`: 元請け会社ID
  - `name`: 工事名称
  - `costBreakdown`: 請負代金内訳（JSON）
  - `siteAgent`: 現場代理人（JSON）
  - `chiefEngineer`: 主任技術者（JSON）

#### AidocumentDocument（書類）

- **用途**: PDFテンプレートと配置済みアイテムを管理
- **主要フィールド**:
  - `pdfTemplateUrl`: PDFテンプレートURL（S3）
  - `items`: 配置済みアイテム（JSON配列）

詳細なスキーマ定義は `prisma/schema/aidocument.prisma` を参照してください。

---

## 主要機能

### 1. 自社情報管理

**パス**: `/aidocument/company`

- ログインユーザーに紐づく自社情報（`type: 'self'`）を編集
- 建設業許可情報、社会保険情報を含む複雑なJSON構造を管理
- **実装ファイル**:
  - `(pages)/company/page.tsx`
  - `(pages)/company/CompanyClient.tsx`
  - `components/company/CompanyForm.tsx`
  - `actions/company-actions.ts`

### 2. 取引先管理

**パス**: `/aidocument/clients`

- 発注者（`type: 'client'`）の一覧表示・作成・編集・削除
- **実装ファイル**:
  - `(pages)/clients/page.tsx`
  - `(pages)/clients/CompaniesClient.tsx`
  - `components/companies/CompanyList.tsx`
  - `components/companies/CompanyFormSimple.tsx`

### 3. 現場管理

**パス**: `/aidocument/clients/[clientId]/sites`

- 現場の基本情報（名称、住所、契約日、金額等）を管理
- スタッフ（技術者・作業員）のCRUD操作
- 車両のCRUD操作
- 下請負人の管理（データベースには保存されるが、UIは未実装）
- **実装ファイル**:
  - `(pages)/clients/[clientId]/sites/page.tsx`
  - `(pages)/clients/[clientId]/sites/SitesClient.tsx`
  - `components/sites/SiteForm.tsx`
  - `actions/site-actions.ts`

### 4. 書類管理

**パス**: `/aidocument/sites/[siteId]/documents`

- 現場に紐づく書類の一覧表示・作成・編集・削除
- **実装ファイル**:
  - `(pages)/sites/[siteId]/documents/page.tsx`
  - `(pages)/sites/[siteId]/documents/DocumentsClient.tsx`
  - `components/documents/DocumentList.tsx`
  - `components/documents/DocumentForm.tsx`
  - `actions/document-actions.ts`

### 5. 書類エディタ

**パス**: `/aidocument/documents/[documentId]/editor`

- PDFテンプレートのアップロード（S3）
- 左サイドバーに現場マスタの各種項目を部品として表示
- ドラッグ&ドロップでPDF上に部品を配置
- 配置済みアイテムの移動・削除
- アイテムの左上ハンドルでのドラッグ操作
- **実装ファイル**:
  - `(pages)/documents/[documentId]/editor/page.tsx`
  - `(pages)/documents/[documentId]/editor/EditorClient.tsx`
  - `components/editor/DocumentEditor.tsx`
  - `components/editor/PdfViewer.tsx`
  - `components/editor/PlacedItem.tsx`
  - `components/editor/ComponentSidebar.tsx`
  - `components/editor/PdfUploadZone.tsx`
  - `hooks/useDocumentEditor.ts`

### 6. AI自動配置（モック実装）

**実装状況**: モック実装のみ（固定パターンでの配置）

- PDFを解析して自動で部品を配置する機能
- 現在は固定パターンでの配置のみ
- 将来的にOpenAI Vision APIと連携予定
- **実装ファイル**:
  - `actions/ai-analyze-actions.ts`

### 7. 管理者機能

**パス**: `/aidocument/admin/[dataModelName]`

- 管理者のみアクセス可能
- 会社（`aidocumentCompany`）とユーザー（`user`）の作成・編集
- `globalIdSelector`による成り変わり機能（他ユーザー・他会社の視点で操作可能）
- **実装ファイル**:
  - `(pages)/admin/[dataModelName]/page.tsx`
  - `(builders)/ColBuilder.tsx`
  - `(builders)/PageBuilder.tsx`
  - `non-common/scope-lib/getScopes.tsx`（`getAidocumentScopes`）

---

## ディレクトリ構成

```
src/app/(apps)/aidocument/
├── (builders)/              # 動的ページ生成用ビルダー
│   ├── ColBuilder.tsx       # カラム定義
│   ├── PageBuilder.tsx      # ページ設定（globalIdSelector含む）
│   ├── ModelBuilder.tsx
│   ├── QueryBuilder.tsx
│   └── ViewParamBuilder.tsx
├── (pages)/                  # ページコンポーネント
│   ├── [dataModelName]/     # 動的マスタページ
│   ├── admin/               # 管理者用ページ
│   ├── clients/             # 取引先管理
│   ├── company/             # 自社情報管理
│   ├── documents/           # 書類エディタ
│   ├── sites/               # 現場管理
│   ├── layout.tsx           # レイアウト
│   └── page.tsx             # トップページ
├── actions/                 # Server Actions
│   ├── ai-analyze-actions.ts
│   ├── client-actions.ts
│   ├── company-actions.ts
│   ├── document-actions.ts
│   ├── document-item-actions.ts
│   └── site-actions.ts
├── components/              # UIコンポーネント
│   ├── clients/
│   ├── companies/
│   ├── company/
│   ├── documents/
│   ├── editor/              # エディタ関連
│   └── sites/
├── hooks/                   # カスタムフック
│   └── useDocumentEditor.ts
├── types/                   # 型定義
│   └── index.ts
└── system-design/           # 設計書
    ├── aidocument_requirements.md
    ├── aidocument_single_file_mock.tsx
    └── DEVELOPER_GUIDE.md   # このファイル
```

---

## 技術スタック

### フロントエンド

- **フレームワーク**: Next.js 14+ (App Router)
- **UIライブラリ**: React 18+
- **スタイリング**: Tailwind CSS
- **アイコン**: lucide-react
- **D&D**: @dnd-kit/core
- **PDF描画**: react-pdf (pdfjs-dist)
- **UIコンポーネント**: shadcn/ui（共通コンポーネントライブラリ経由）

### バックエンド

- **ORM**: Prisma
- **データベース**: PostgreSQL
- **ファイルストレージ**: AWS S3
- **認証**: NextAuth.js（共通システム経由）

### 開発ツール

- **型チェック**: TypeScript
- **リンター**: ESLint
- **フォーマッター**: Prettier

---

## 実装済み機能

### ✅ データベーススキーマ

- [x] Prismaスキーマ定義（`aidocument.prisma`）
- [x] 企業マスタ（自社・取引先・下請け）
- [x] 現場マスタ（基本情報、スタッフ、車両、下請負人）
- [x] 書類マスタ（PDFテンプレート、配置アイテム）
- [x] AI解析キャッシュ

### ✅ 認証・権限管理

- [x] ログインユーザーと自社の紐付け（`User.aidocumentCompanyId`）
- [x] 管理者権限チェック
- [x] 管理者用成り変わり機能（`globalIdSelector`）

### ✅ 自社情報管理

- [x] 自社情報の表示・編集
- [x] 建設業許可情報の管理（JSON配列）
- [x] 社会保険情報の管理（JSONオブジェクト）

### ✅ 取引先管理

- [x] 取引先一覧表示
- [x] 取引先の作成・編集・削除
- [x] 取引先に紐づく現場一覧への遷移

### ✅ 現場管理

- [x] 現場の基本情報CRUD
- [x] スタッフのCRUD（名前、年齢、性別、役割、資格等）
- [x] 車両のCRUD（プレート番号、利用期間）
- [x] 現場に紐づく書類一覧への遷移
- [x] 金額内訳、現場代理人、主任技術者等の情報管理（JSON）

### ✅ 書類管理

- [x] 書類一覧表示
- [x] 書類の作成・編集・削除
- [x] 書類エディタへの遷移

### ✅ 書類エディタ

- [x] PDFテンプレートのアップロード（S3）
- [x] PDFの表示（react-pdf）
- [x] 左サイドバーに現場マスタの部品を表示
- [x] ドラッグ&ドロップで部品を配置
- [x] 配置済みアイテムの移動（左上ハンドルでのドラッグ）
- [x] 配置済みアイテムの削除
- [x] 座標の保存（mm単位）
- [x] 固定サイズでのエディタ表示（画面サイズに依存しない）

### ✅ 管理者機能

- [x] 管理者用データモデルページ（`/[dataModelPage]`）
- [x] 会社・ユーザーの作成・編集
- [x] `ColBuilder`による動的フォーム生成
- [x] `globalIdSelector`による成り変わり機能

### ✅ ナビゲーション

- [x] 自社情報管理へのリンク
- [x] 取引先マスタ管理へのリンク
- [x] 管理者メニュー（管理者のみ表示）

---

## 未実装機能

### ❌ PDFエクスポート・印刷機能

**要件**: 配置済みアイテムを含むPDFを生成・ダウンロード・印刷

**必要な実装**:

- PDFにテキストを重ね書きする機能（`pdf-lib`や`pdfjs-dist`を使用）
- ブラウザの印刷機能との連携
- PDFダウンロード機能

**優先度**: 高

### ❌ AI解析の実装（OpenAI Vision API連携）

**要件**: PDFテンプレートをAIが解析し、適切な位置に自動で情報を配置

**現在の状態**: モック実装のみ（固定パターンでの配置）

**必要な実装**:

- OpenAI Vision APIとの連携
- PDFを画像に変換
- AI解析結果のキャッシュ機能（`AidocumentAnalysisCache`を使用）
- 解析結果の信頼度表示
- ユーザーによる配置の承認・修正機能

**優先度**: 中

### ❌ 下請負人の詳細管理UI

**要件**: 現場に紐づく下請負人の詳細情報を管理するUI

**現在の状態**: データベーススキーマは実装済み（`AidocumentSubcontractor`）だが、UI未実装

**必要な実装**:

- `SiteForm`に下請負人管理セクションを追加
- 下請負人の作成・編集・削除UI
- 下請負人のスタッフ情報管理（JSON）

**優先度**: 中

### ❌ 書類テンプレート管理

**要件**: よく使うPDFテンプレートを保存・再利用

**必要な実装**:

- テンプレート一覧ページ
- テンプレートの作成・編集・削除
- テンプレートから書類を作成する機能

**優先度**: 低

### ❌ 書類の一括操作

**要件**: 複数の書類を一度に操作（削除、エクスポート等）

**必要な実装**:

- チェックボックスによる複数選択
- 一括削除機能
- 一括エクスポート機能

**優先度**: 低

### ❌ 検索・フィルタ機能

**要件**: 取引先、現場、書類の検索・フィルタ

**必要な実装**:

- 検索バーの実装
- フィルタUI（日付範囲、金額範囲等）
- ソート機能

**優先度**: 中

### ❌ エクスポート機能（CSV、Excel等）

**要件**: 現場マスタ、書類一覧等をCSVやExcelでエクスポート

**必要な実装**:

- CSVエクスポート機能
- Excelエクスポート機能（`xlsx`ライブラリ等）

**優先度**: 低

### ❌ 書類のバージョン管理

**要件**: 書類の編集履歴を保持

**必要な実装**:

- 書類のバージョン管理テーブル
- 履歴表示UI
- 過去バージョンへの復元機能

**優先度**: 低

### ❌ リアルタイム共同編集

**要件**: 複数ユーザーが同時に書類を編集

**必要な実装**:

- WebSocketまたはServer-Sent Eventsによるリアルタイム同期
- 競合解決機能

**優先度**: 低

---

## 開発ガイドライン

### コーディング規約

1. **TypeScript**: 型安全性を重視し、`any`の使用を避ける
2. **コンポーネント分割**: 再利用可能な小さなコンポーネントに分割
3. **Server Actions**: データベース操作は必ずServer Action経由で実行
4. **エラーハンドリング**: 適切なエラーメッセージをユーザーに表示

### ファイル命名規則

- **ページ**: `page.tsx`（Next.js App Routerの規約）
- **クライアントコンポーネント**: `*Client.tsx`
- **サーバーコンポーネント**: 通常の`.tsx`
- **Server Actions**: `*-actions.ts`

### データベース操作

- Prismaクライアントは`src/lib/prisma.ts`から取得
- トランザクションが必要な場合は`prisma.$transaction`を使用
- エラーハンドリングは必ず実装

### 座標系の扱い

- **保存**: mm単位（PDF座標系）
- **表示**: ピクセル単位（画面座標系）
- **変換**: `mmToPx`と`pxToMm`関数を使用
- **固定サイズ**: エディタは800px幅で固定（画面サイズに依存しない）

### PDF操作

- PDF.js workerは`unpkg.com`から読み込み
- S3からのPDF読み込みにはCORS設定が必要
- PDFのアップロードは`FileHandler.sendFileToS3`を使用

### ドラッグ&ドロップ

- `@dnd-kit/core`を使用
- ドラッグハンドルは左上のみ（`PlacedItem.tsx`）
- 座標計算は固定サイズベースで実行

---

## トラブルシューティング

### PDFが読み込めない

**原因**: CORSエラーまたはPDF.js workerの読み込み失敗

**解決方法**:

1. S3バケットのCORS設定を確認
2. PDF.js workerのURLを確認（`unpkg.com`を使用）
3. ブラウザのコンソールでエラーを確認

### ドラッグ&ドロップの座標がずれる

**原因**: 画面サイズによる座標計算のずれ

**解決方法**:

- エディタは固定サイズ（800px幅）で実装済み
- `FIXED_WIDTH`と`FIXED_HEIGHT`定数を使用しているか確認

### スタッフ・車両の保存が反映されない

**原因**: `SitesClient.tsx`の`handleSave`でCRUD処理が不完全

**解決方法**:

- 保存後に`getSites`で最新データを取得し、ステートを更新しているか確認
- 既存データと新規データの比較ロジックを確認

### 管理者の成り変わりが機能しない

**原因**: `getScopes.tsx`の`getAidocumentScopes`が正しく実装されていない

**解決方法**:

- `query`パラメータから`userId`と`companyId`を取得しているか確認
- `PageBuilder.tsx`の`getGlobalIdSelector`が正しく呼び出されているか確認

---

## 参考資料

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [react-pdf Documentation](https://react-pdf.org/)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)

---

## 更新履歴

- 2025-01-XX: 初版作成
  - 実装済み機能の整理
  - 未実装機能のリストアップ
  - 開発ガイドラインの追加
