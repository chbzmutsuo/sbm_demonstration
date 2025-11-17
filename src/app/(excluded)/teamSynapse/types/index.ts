// データ収集の共通形式
export type CollectedMessage = {
  source: 'gmail' | 'chat' | 'drive_docs'
  id: string
  date: string // ISO 8601形式
  from?: string
  to?: string
  title?: string
  body: string
}

// AI分析結果の型定義
export type Viewpoints = {
  viewpoints: string[]
}

export type FactAnalysis = {
  [viewpoint: string]: string[]
}

export type Action = {
  category: string
  suggestion: string
}

export type ActionSuggestions = {
  actions: Action[]
}

export type AnalysisResult = {
  viewpoints: Viewpoints
  factAnalysis: FactAnalysis
  actionSuggestions: ActionSuggestions
}

// 連携サービス
export type ServiceType = 'gmail' | 'chat' | 'drive'

// フォーム入力の型
export type AnalysisFormData = {
  enabledServices: ServiceType[]
  gmail: {
    targetEmails: string[]
    dateFrom: string
    dateTo: string
  }
  chat: {
    roomId: string
    dateFrom: string
    dateTo: string
  }
  drive: {
    folderUrl: string
  }
}
