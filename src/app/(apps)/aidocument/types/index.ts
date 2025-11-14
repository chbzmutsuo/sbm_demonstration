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
