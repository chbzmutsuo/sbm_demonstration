'use server'

import {getSiteById} from './site-actions'
import {PlacedItem} from '../types'

interface AnalyzePdfRequest {
  pdfUrl: string
  siteId: number
  documentId: number
}

interface AnalyzePdfResponse {
  success: boolean
  result?: {
    items: Array<{
      componentId: string
      x: number
      y: number
      confidence: number
      fieldType: string
    }>
    analysisMetadata: {
      analyzedAt: Date
      model: string
      processingTime: number
    }
  }
  error?: string
}

/**
 * PDFを解析して自動配置（モック実装）
 * 将来的にOpenAI Vision APIと連携
 */
export const analyzePdfAndAutoPlace = async (request: AnalyzePdfRequest): Promise<AnalyzePdfResponse> => {
  try {
    const startTime = Date.now()

    // 現場データを取得
    const siteResult = await getSiteById(request.siteId)
    if (!siteResult.success || !siteResult.result) {
      return {
        success: false,
        error: '現場データの取得に失敗しました',
      }
    }

    const site = siteResult.result

    // モック実装: 固定パターンでの配置
    // 将来的にOpenAI Vision APIを使用してPDFを解析
    const mockItems: PlacedItem[] = [
      {componentId: 's_name', x: 50, y: 30, value: site.name},
      {componentId: 's_address', x: 50, y: 45, value: site.address || ''},
      {
        componentId: 's_amount',
        x: 150,
        y: 60,
        value: site.amount ? `${site.amount.toLocaleString()} 円` : '',
      },
      {
        componentId: 's_startDate',
        x: 50,
        y: 75,
        value: site.startDate ? new Date(site.startDate).toLocaleDateString('ja-JP') : '',
      },
      {
        componentId: 's_endDate',
        x: 120,
        y: 75,
        value: site.endDate ? new Date(site.endDate).toLocaleDateString('ja-JP') : '',
      },
    ]

    // スタッフ情報を追加
    site.Staff?.forEach((staff, index) => {
      const baseY = 100 + index * 20
      mockItems.push({componentId: `${staff.id}_name`, x: 50, y: baseY, value: staff.name})
      mockItems.push({
        componentId: `${staff.id}_age`,
        x: 120,
        y: baseY,
        value: staff.age?.toString() || '',
      })
      mockItems.push({
        componentId: `${staff.id}_gender`,
        x: 150,
        y: baseY,
        value: staff.gender || '',
      })
    })

    // 車両情報を追加
    site.Vehicle?.forEach((vehicle, index) => {
      const baseY = 100 + (site.Staff?.length || 0) * 20 + index * 20
      mockItems.push({componentId: `${vehicle.id}_plate`, x: 50, y: baseY, value: vehicle.plate})
      mockItems.push({
        componentId: `${vehicle.id}_term`,
        x: 150,
        y: baseY,
        value: vehicle.term || '',
      })
    })

    const processingTime = Date.now() - startTime

    return {
      success: true,
      result: {
        items: mockItems.map(item => ({
          componentId: item.componentId,
          x: item.x,
          y: item.y,
          confidence: 0.8, // モックなので固定値
          fieldType: 'auto-detected',
        })),
        analysisMetadata: {
          analyzedAt: new Date(),
          model: 'mock-v1',
          processingTime,
        },
      },
    }
  } catch (error) {
    console.error('AI解析エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI解析に失敗しました',
    }
  }
}
