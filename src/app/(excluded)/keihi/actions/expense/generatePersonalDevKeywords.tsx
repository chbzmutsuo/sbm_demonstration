import {ExpenseFormData} from '@app/(excluded)/keihi/types'

// 個人開発関連キーワードの生成
export const generatePersonalDevKeywords = (formData: ExpenseFormData): string[] => {
  const baseKeywords = [
    'Next.js',
    'React',
    'TypeScript',
    'Prisma',
    'Tailwind CSS',
    'API開発',
    'データベース設計',
    'UI/UX',
    'レスポンシブデザイン',
    '認証システム',
    'ファイルアップロード',
    'リアルタイム通信',
    'PWA',
    'モバイルアプリ',
    'Webアプリ',
    'SaaS',
    'MVP',
    'ユーザビリティ',
    'パフォーマンス最適化',
    'SEO対策',
    'CI/CD',
    'Docker',
    'Vercel',
    'AWS',
    'Firebase',
    'GraphQL',
    'REST API',
    'WebSocket',
    'マイクロサービス',
    'テスト駆動開発',
    'アジャイル開発',
    'スクラム',
    'デザインシステム',
    'コンポーネント設計',
    '状態管理',
    'フォーム処理',
    'バリデーション',
    'エラーハンドリング',
    'ログ管理',
    '監視',
    'セキュリティ',
    'GDPR対応',
    'アクセシビリティ',
    'インターナショナライゼーション',
    'マーケティング自動化',
    'CRM',
    'ERP',
    'BI',
    '機械学習',
    'AI',
    'チャットボット',
    '自然言語処理',
    'ブロックチェーン',
    'IoT',
    'AR/VR',
    'ゲーミフィケーション',
  ]

  const purposeKeywords: {[key: string]: string[]} = {
    新規開拓: ['CRM', 'マーケティング自動化', 'BI', 'データ分析'],
    既存顧客フォロー: ['チャットボット', 'CRM', 'ユーザビリティ', 'フォーム処理'],
    情報収集: ['API開発', 'データベース設計', 'ログ管理', 'BI'],
    技術相談: ['MVP', 'プロトタイピング', 'アジャイル開発', 'テスト駆動開発'],
    商談: ['デモアプリ', 'UI/UX', 'ユーザビリティ', 'レスポンシブデザイン'],
  }

  let relevantKeywords = [...baseKeywords]

  // 目的に基づくキーワード追加
  if (formData.conversationPurpose && formData.conversationPurpose.length > 0) {
    formData.conversationPurpose.forEach(purpose => {
      if (purposeKeywords[purpose]) {
        relevantKeywords = [...relevantKeywords, ...purposeKeywords[purpose]]
      }
    })
  }

  // 既存のキーワードも含める
  if (formData.keywords && formData.keywords.length > 0) {
    relevantKeywords = [...relevantKeywords, ...formData.keywords]
  }

  // 重複を除去してランダムに3-6個選択
  const uniqueKeywords = [...new Set(relevantKeywords)]
  const shuffled = uniqueKeywords.sort(() => 0.5 - Math.random())
  const count = Math.floor(Math.random() * 4) + 3 // 3-6個

  return shuffled.slice(0, count)
}
