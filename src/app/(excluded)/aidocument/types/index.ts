import {
  AidocumentCompany,
  AidocumentSite,
  AidocumentStaff,
  AidocumentVehicle,
  AidocumentDocument,
  AidocumentDocumentItem,
  AidocumentSubcontractor,
} from '@prisma/client'

// 企業の型（関連データ含む）
export type CompanyWithSites = AidocumentCompany & {
  SitesAsClient: AidocumentSite[]
}

// 取引先の型（関連データ含む）
// client-actions.tsではSiteリレーションを含むため、この型を使用
export type ClientWithSites = AidocumentCompany & {
  SitesAsClient: AidocumentSite[]
  // client-actions.tsの実装に合わせて、Siteという名前でもアクセス可能にする
  Site?: AidocumentSite[]
}

// 現場の型（関連データ含む）
export type SiteWithRelations = AidocumentSite & {
  Staff: AidocumentStaff[]
  aidocumentVehicles: AidocumentVehicle[]
  Subcontractors: AidocumentSubcontractor[]
  Document: AidocumentDocument[]
  Client: AidocumentCompany
  Company: AidocumentCompany
}

// 書類の型（関連データ含む）
export type DocumentWithRelations = AidocumentDocument & {
  DocumentItem: AidocumentDocumentItem[]
  Site: SiteWithRelations
}

// 書類項目の型
export type DocumentItem = AidocumentDocumentItem

// 部品コンポーネントの型
export interface Component {
  id: string
  label: string
  value: any
  group: string
}

// 配置済みアイテムの型（JSONから変換）
export interface PlacedItem {
  componentId: string
  x: number
  y: number
  value?: string
  fontSize?: number // フォントサイズ（ポイント単位、デフォルト: 10.5）
  pageIndex?: number // ページ番号（0ベース、デフォルト: 0）
}

// 建設業許可情報の型
export interface ConstructionLicense {
  type: string
  number: string
  date: string
}

// 社会保険情報の型
export interface SocialInsurance {
  health: 'joined' | 'not_joined' | 'exempt'
  pension: 'joined' | 'not_joined' | 'exempt'
  employment: 'joined' | 'not_joined' | 'exempt'
  officeName?: string
  officeCode?: string
}

// 金額内訳の型
export interface CostBreakdown {
  directCost: number
  commonTemporaryCost: number
  siteManagementCost: number
  generalManagementCost: number
  subtotal: number
  tax: number
}

// 現場代理人の型
export interface SiteAgent {
  name: string
  qualification: string
  authority: string
}

// 主任技術者の型
export interface ChiefEngineer {
  name: string
  type: 'full_time' | 'part_time'
  qualification: string
  qNumber: string
  qDate: string
}

// AIプロバイダーの型
export type AIProvider = 'gemini' | 'openai'

// AI解析結果の型（Gemini/OpenAI共通）
export interface GeminiAnalysisResult {
  items: Array<{
    componentId: string
    x: number // mm単位
    y: number // mm単位
    confidence: number // 0-1の信頼度
    fieldType: string
    pageIndex?: number // ページ番号（0ベース）
    imageX?: number // 画像上のX座標（ピクセル）- 変換用
    imageY?: number // 画像上のY座標（ピクセル）- 変換用
  }>
  analysisMetadata: {
    analyzedAt: Date
    model: string
    processingTime: number
  }
}

// OpenAI APIからの生の応答型（ピクセル座標を含む）
export interface OpenAIAnalysisRawResult {
  items: Array<{
    componentId: string
    imageX: number // 画像上のX座標（ピクセル）
    imageY: number // 画像上のY座標（ピクセル）
    confidence: number // 0-1の信頼度
    fieldType: string
    pageIndex: number // ページ番号（0ベース）
  }>
  analysisMetadata: {
    analyzedAt: string
    model: string
    processingTime: number
  }
}

// PDF画像データの型
export interface PdfImageData {
  imageBase64: string // Base64エンコードされた画像
  width: number // 画像の幅（ピクセル）
  height: number // 画像の高さ（ピクセル）
  pdfWidth: number // PDFの幅（mm）
  pdfHeight: number // PDFの高さ（mm）
}

// Gemini APIリクエスト用の型
export interface GeminiApiRequest {
  pdfImages: PdfImageData[] // 画像データとサイズ情報の配列
  siteData: {
    name: string
    address?: string
    amount?: number
    startDate?: Date | string
    endDate?: Date | string
    staff?: Array<{
      id: number
      name: string
      age?: number
      gender?: string
      term?: string
    }>
    vehicles?: Array<{
      id: number
      plate: string
      term?: string
    }>
  }
  companyData?: {
    name: string
    representativeName?: string
    address?: string
    phone?: string
    constructionLicense?: Array<{
      type: string
      number: string
      date: string
    }>
    socialInsurance?: {
      health?: string
      pension?: string
      employment?: string
      officeName?: string
      officeCode?: string
    }
  }
  components?: Component[] // コンポーネント情報（プロンプト生成用）
}
