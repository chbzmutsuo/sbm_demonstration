'use server'

import {getSiteById} from './site-actions'
import {AIProvider, PdfImageData} from '../types'
import {analyzePdfWithGemini} from '../utils/geminiApi'
import {analyzePdfWithOpenAI} from '../utils/openaiApi'
import {generateComponentsFromSite} from '../utils/componentUtils'

interface AnalyzePdfRequest {
  pdfImages: PdfImageData[] // 画像データとサイズ情報の配列（クライアント側で変換済み）
  siteId: number
  documentId: number
  provider?: AIProvider // AIプロバイダー（デフォルト: 'gemini'）
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
      pageIndex?: number
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
 * PDFを解析して自動配置（Gemini API / OpenAI API使用）
 */
export const analyzePdfAndAutoPlace = async (request: AnalyzePdfRequest): Promise<AnalyzePdfResponse> => {
  const provider = request.provider || 'gemini' // デフォルトはGemini
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

    // クライアント側で変換済みの画像を使用
    const pdfImages = request.pdfImages

    if (pdfImages.length === 0) {
      return {
        success: false,
        error: 'PDF画像が提供されていません',
      }
    }

    // コンポーネント情報を生成（プロンプト生成用）
    const components = await generateComponentsFromSite(site)

    // AI APIで解析（プロバイダーに応じて切り替え）
    const apiRequest = {
      pdfImages,
      components, // コンポーネント情報を追加
      siteData: {
        name: site.name,
        address: site.address || undefined,
        amount: site.amount || undefined,
        startDate: site.startDate || undefined,
        endDate: site.endDate || undefined,
        staff: site.Staff?.map(s => ({
          id: s.id,
          name: s.name,
          age: s.age || undefined,
          gender: s.gender || undefined,
          term: s.term || undefined,
        })),
        vehicles: site.aidocumentVehicles?.map(v => ({
          id: v.id,
          plate: v.plate,
          term: v.term || undefined,
        })),
      },
      companyData: site.Company
        ? {
            name: site.Company.name,
            representativeName: site.Company.representativeName || undefined,
            address: site.Company.address || undefined,
            phone: site.Company.phone || undefined,
            constructionLicense:
              site.Company.constructionLicense && Array.isArray(site.Company.constructionLicense)
                ? (site.Company.constructionLicense as Array<{type: string; number: string; date: string}>).map(l => ({
                    type: l.type,
                    number: l.number,
                    date: l.date,
                  }))
                : undefined,
            socialInsurance:
              site.Company.socialInsurance && typeof site.Company.socialInsurance === 'object'
                ? {
                    health: (site.Company.socialInsurance as any).health,
                    pension: (site.Company.socialInsurance as any).pension,
                    employment: (site.Company.socialInsurance as any).employment,
                    officeName: (site.Company.socialInsurance as any).officeName,
                    officeCode: (site.Company.socialInsurance as any).officeCode,
                  }
                : undefined,
          }
        : undefined,
    }

    const analysisResult = provider === 'openai' ? await analyzePdfWithOpenAI(apiRequest) : await analyzePdfWithGemini(apiRequest)

    console.log(analysisResult)

    const processingTime = Date.now() - startTime

    return {
      success: true,
      result: {
        items: analysisResult.items.map(item => {
          return {
            componentId: item.componentId,
            x: item.x,
            y: item.y,
            confidence: item.confidence,
            fieldType: item.fieldType,
            pageIndex: item.pageIndex,
          }
        }),
        analysisMetadata: {
          analyzedAt: analysisResult.analysisMetadata.analyzedAt,
          model: analysisResult.analysisMetadata.model,
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
