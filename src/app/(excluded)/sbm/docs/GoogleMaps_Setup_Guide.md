# Google Maps API 連携セットアップガイド

## 🎯 実装完了機能

本格的なGoogle Maps API連携ロジックが構築されました：

### ✅ 完了済み機能

1. **Google Maps コアライブラリ** (`src/cm/hooks/useGoogleMaps.tsx`)
   - 地図表示・初期化
   - マーカー表示・管理
   - ルート描画・最適化
   - ジオコーディング（住所⇄座標変換）
   - ユーザー位置取得

2. **地図コンポーネント** (`src/cm/components/GoogleMap/GoogleMapComponent.tsx`)
   - 再利用可能な地図コンポーネント
   - 単一/複数場所表示モード
   - ルート表示モード
   - レスポンシブ対応

3. **ジオコーディングサービス** (`src/cm/lib/googleMaps/geocodingService.ts`)
   - 住所から座標の取得
   - 座標から住所の取得
   - SBMアプリの住所形式との連携
   - バッチ処理対応（レート制限考慮）

4. **ルート最適化サービス** (`src/cm/lib/googleMaps/routeOptimizationService.ts`)
   - 配達効率最大化アルゴリズム
   - 時間窓制約対応
   - 優先度考慮
   - 効率レポート生成

5. **予約システム統合** (`src/app/(apps)/sbm/components/ReservationMapModal.tsx`)
   - 予約ページへの地図機能統合
   - 単一・複数・ルート表示モード
   - 配達先マップ表示
   - ルート最適化機能

## 🔧 セットアップ手順

### 1. Google Cloud Platform設定

1. [Google Cloud Platform Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存プロジェクトを選択
3. 以下のAPIを有効化：
   ```
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Places API (オプション)
   ```

### 2. APIキーの取得・設定

1. **APIキーの作成**
   - Google Cloud Console → 認証情報 → APIキーを作成
   - APIキーに制限を設定（セキュリティのため）

2. **環境変数の設定**

   ```bash
   # .env.local ファイルに追加
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

   # 既存の環境変数も確認
   NEXT_PUBLIC_GCP_DIRECTIONS_API_KEY=your_api_key_here
   ```

### 3. APIキーの制限設定（推奨）

```
アプリケーションの制限:
- HTTPリファラー（Webサイト）
- 許可するサイト: https://yourdomain.com/*

API制限:
- Maps JavaScript API
- Geocoding API
- Directions API
- Places API
```

## 🚀 使用方法

### 基本的な地図表示

```tsx
import {GoogleMapComponent} from '@cm/components/GoogleMap/GoogleMapComponent'

;<GoogleMapComponent
  locations={[
    {
      lat: 35.6762,
      lng: 139.6503,
      title: '東京駅',
      description: '配達先',
    },
  ]}
  height={400}
  enableUserLocation={true}
/>
```

### ルート最適化

```tsx
import {routeOptimizationService} from '@cm/lib/googleMaps/routeOptimizationService'

const result = await routeOptimizationService.optimizeRoute(deliveryStops)
console.log(`最適化結果: ${result.totalDistance}km, ${result.totalDuration}分`)
```

### 住所のジオコーディング

```tsx
import {geocodingService} from '@cm/lib/googleMaps/geocodingService'

const location = await geocodingService.geocodeFromSBMAddress({
  prefecture: '東京都',
  city: '千代田区',
  street: '丸の内1-1-1',
})
```

## 💰 料金について

Google Maps APIは従量課金制です：

- **Maps JavaScript API**: $7.00 / 1,000回
- **Geocoding API**: $5.00 / 1,000回
- **Directions API**: $5.00 / 1,000回

月間$200の無料枠があります。

## 🔍 動作確認

### 1. 環境変数の確認

```javascript
console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
```

### 2. 地図の表示確認

- 予約管理ページで「地図表示」ボタンをクリック
- 個別の予約で地図アイコン（📍）をクリック

### 3. ルート最適化の確認

- 複数の予約を表示 → 地図表示 → 「最適化」ボタンをクリック

## ⚠️ トラブルシューティング

### よくある問題

1. **地図が表示されない**
   - APIキーが正しく設定されているか確認
   - APIが有効化されているか確認
   - コンソールエラーを確認

2. **ジオコーディングが失敗する**
   - 住所の形式を確認
   - Geocoding APIが有効か確認
   - レート制限に達していないか確認

3. **ルート計算ができない**
   - Directions APIが有効か確認
   - 座標が正しいか確認
   - 配達先が25件以下か確認（Google制限）

### デバッグモード

開発環境では追加のデバッグ情報が表示されます：

- 地図右上に統計情報
- コンソールに詳細ログ

## 📞 サポート

実装に関する質問や問題がございましたら、開発チームまでお問い合わせください。

---

**📍 Google Maps API 連携完了！**
効率的な配達管理をお楽しみください 🚚✨
