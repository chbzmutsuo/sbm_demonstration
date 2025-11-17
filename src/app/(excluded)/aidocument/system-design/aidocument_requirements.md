# Next.js アプリケーション仕様設計書 (書類管理システム)

## 1. 概要

本ドキュメントは、単一ファイルで構築された「書類管理アプリケーション」のモックアップを、Next.js (App Router) を用いたスケーラブルなWebアプリケーションとして再設計・構築するための仕様を定義する。

**目的:**

- 保守性と拡張性の高いディレクトリ構成の確立
- コンポーネントベースのクリーンなUI設計
- 将来的なAPI連携を見据えたデータフローの定義

**主要機能 (モックアップに基づく):**

- 取引先マスタ管理 (CRUD)
- 現場管理 (CRUD / 取引先に紐づく)
- 書類管理 (CRUD / 現場に紐づく)
- 書類レイアウトエディタ (D&Dによる部品配置)

# 本アプリの機能一覧

本アプリは、**公共工事の書類作成にかかる時間を短縮し、効率化**を図ることを目的としています。

現場＞案件ごとに存在する複数のPDFファイルに対して、現場マスタにある情報をドラッグアンドドロップにて、簡単に配置できるようにする。（同じ現場や類似の案件でもテンプレートは毎回様々なレイアウトになる）

また、テンプレートの情報をAIが理解することで、必要な部品を必要な配置に自動で並べてくれるようにする。

## 現場マスタ管理ページ

以下の情報に関して、CRUDできるページとする。

- 基本的な情報
  - 現場名
  - 住所
  - 金額
  - 施工期間
- 1対多数の各種情報
  - 担当スタッフ（名称、年齢、性別、担当期間）
  - 利用車両（プレート番号、期間）
  - その他必要に応じて

## 案件管理ページおよびDocuments管理ページ

現場に対して、1対多数で「案件」をつくる。

案件には、さらに1対一で、「Document」を作る。

Documentテーブル

- 書類名称
- すかしとなるPDFファイル（【下地】）
- 各種項目（現場マスタで管理しているもの）の内容とすかしPDF上での位置情報（JSON）

Document個別詳細ページの挙動

- PDFファイルの無地のテンプレート（【下地】）を登録
- 左サイドバーに現場マスタの各種項目が【部品】として整列。
- 画面中央には、PDFファイルの中身を下地として表示。
- 部品をドラッグアンドドロップにて、下地上に配置。
- 保存。PDFファイルとして印刷

付加機能：AIによって下地に対して付与すべき項目と位置情報を分析し、自動で部品を配置する機能。

## 2. 技術スタック

- **フレームワーク**: Next.js 14+ (App Router)
- **UIライブラリ**: React 18+
- **スタイリング**: Tailwind CSS
- **アイコン**: lucide-react
- **D&D (推奨)**: `react-dnd` または `dnd-kit`
- **PDF描画 (推奨)**: `react-pdf` (または `pdf.js`)
- **UIコンポーネント (推奨)**: shadcn/ui
- **型**: TypeScript (または JSDocによる型定義)

## 5. コンポーネント詳細 (分割案)

モックアップの単一ファイルからコンポーネントを適切に分割する。

### 5.1. UIコンポーネント (`components/ui/`)

既存のものを仕様

### 5.2. ドメインコンポーネント

- **`app/clients/page.jsx` (`"use client";`)**
  - `hooks/useClientManager` を使用。
  - `components/clients/ClientList.jsx`: 取引先一覧表示
  - `components/clients/ClientForm.jsx`: 新規/編集モーダル (`Modal` を使用)
- **`app/sites/[clientId]/page.jsx` (`"use client";`)**
  - `hooks/useClientManager`, `hooks/useSiteManager` を使用。
  - `components/common/Breadcrumbs.jsx`: パンくずリスト
  - `components/sites/SiteList.jsx`: 現場カード一覧
  - `components/sites/SiteCard.jsx`: 現場カード (詳細表示)
  - `components/sites/SiteForm.jsx`: 新規/編集モーダル (スタッフ・車両編集含む)
- **`app/documents/[siteId]/page.jsx` (`"use client";`)**
  - `hooks/useClientManager`, `hooks/useSiteManager`, `hooks/useDocumentManager` を使用。
  - `components/common/Breadcrumbs.jsx`
  - `components/documents/DocumentList.jsx`: 書類一覧
  - `components/documents/DocumentForm.jsx`: 新規/名称変更モーダル
- **`app/editor/[documentId]/page.jsx` (`"use client";`)**
  - `hooks/useDocumentEditor` を使用。
  - `components/editor/DocumentEditor.jsx`: D&Dロジック、ヘッダー、メインコンテンツを含むラッパー。
  - `components/editor/ComponentSidebar.jsx`: 左側の部品リスト。
  - `components/editor/PdfUploadZone.jsx`: 下地アップロードUI。
  - `components/editor/PlacedItem.jsx`: 配置済みアイテムの描画。

    ##

## 7. PDF/画像 下地の実装

- モックアップの `PdfUploadZone` は `URL.createObjectURL` を使用し、クライアントサイドでのみ有効なURLを生成している。
- **推奨実装 (画像)**: 画像ファイル (PNG/JPG) をアップロードした場合、Next.js の API Route または外部ストレージ (Vercel Blob, S3等) に保存し、永続的なURL (例: `/uploads/image.png`) を取得する。このURLを `Document` の `pdfTemplateUrl` に保存する。
- **推奨実装 (PDF)**: PDF描画が必要な場合、`react-pdf` ライブラリを導入する。`PdfUploadZone` でPDFがアップロードされたら、画像と同様に保存し、エディタ画面では `<Document file={url}>` と `<Page>` コンポーネントを使ってPDFを `<canvas>` として描画する。その上にD&Dアイテムを絶対配置する。
