export const CONVERSATION_PURPOSES = [
  {value: '営業活動', label: '営業活動'},
  {value: 'リクルーティング', label: 'リクルーティング'},
  {value: '技術・アイデア相談', label: '技術相談'},
  {value: 'ビジネス相談', label: 'ビジネス相談'},
  {value: '研修・学習', label: '研修・学習'},
  {value: '情報交換', label: '情報交換'},
] as const

// 初期値として選択される項目
export const DEFAULT_CONVERSATION_PURPOSES = ['営業活動', 'リクルーティング'] as const

// 型定義
export type ConversationPurposeValue = (typeof CONVERSATION_PURPOSES)[number]['value']
export type ConversationPurpose = (typeof CONVERSATION_PURPOSES)[number]
