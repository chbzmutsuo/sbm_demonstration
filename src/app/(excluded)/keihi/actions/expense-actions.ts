'use server'

import {FileHandler} from 'src/cm/class/FileHandler'
import {S3FormData} from '@cm/class/FileHandler'
import prisma from 'src/lib/prisma'
import {ExpenseFilterType} from '../hooks/useExpenseFilter'
import {
  exportAllExpensesToCSV,
  exportSelectedExpensesToCSV,
  exportAllLocationsToCSV,
  exportSelectedLocationsToCSV,
} from './csv-actions'
import {
  syncAllExpensesToSpreadsheet,
  syncSelectedExpensesToSpreadsheet,
  syncAllLocationsToSpreadsheet,
  syncSelectedLocationsToSpreadsheet,
} from './spreadsheet-actions'

export interface AIAnalysisResult {
  techInsightDetail: string
  techInsightSummary: string
  autoTags: string[]
  mfSubject: string
  mfTaxCategory: string
}

// インサイト生成の設定オプション
interface InsightGenerationOptions {
  isDraft?: boolean // 下書きモードかどうか
  additionalInstruction?: string // 追加指示
  includeMoneyForwardData?: boolean // MoneyForward用データを含めるか
}

// インサイト生成結果の型
interface InsightGenerationResult {
  techInsightDetail: string
  techInsightSummary: string
  autoTags: string[]
  generatedKeywords?: string[] // 下書きモードの場合のみ
  mfSubject?: string // MoneyForward用データ
  mfTaxCategory?: string
}

// 経費記録一覧取得パラメータ
interface GetExpensesParams {
  page: number
  limit: number
  filter: ExpenseFilterType
  sort: {
    field: string | null
    order: string
  }
}

// Prismaのwhere条件を構築する関数
const buildWhereCondition = (filter: ExpenseFilterType) => {
  const where: any = {}

  // 日付範囲フィルター
  if (filter.dateRange.start || filter.dateRange.end) {
    where.date = {}
    if (filter.dateRange.start) {
      where.date.gte = new Date(filter.dateRange.start)
    }
    if (filter.dateRange.end) {
      where.date.lte = new Date(filter.dateRange.end)
    }
  }

  // 科目フィルター
  if (filter.mfSubject) {
    where.mfSubject = filter.mfSubject
  }

  // ステータスフィルター
  if (filter.status) {
    where.status = filter.status
  }

  // キーワード検索
  if (filter.keyword) {
    where.OR = [
      {participants: {contains: filter.keyword}},
      {counterparty: {contains: filter.keyword}},
      {conversationSummary: {contains: filter.keyword}},
      {summary: {contains: filter.keyword}},
      {insight: {contains: filter.keyword}},
    ]
  }

  return where
}

// 経費記録一覧取得
export const getExpenses = async (params: GetExpensesParams) => {
  try {
    const whereCondition = buildWhereCondition(params.filter)

    // ソート条件の構築
    let orderBy: any = {date: 'desc'} // デフォルトは日付降順
    if (params.sort.field && params.sort.field !== 'imageTitle') {
      orderBy = [{[params.sort.field]: params.sort.order}, {id: 'desc'}]
    } else if (params.sort.field === 'imageTitle') {
      // 画像タイトルでソートする場合は添付ファイルの originalName でソート
      orderBy = {}
    }

    const expenses = await prisma.keihiExpense.findMany({
      include: {
        KeihiAttachment: true,
      },
      where: whereCondition,
      orderBy,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    })

    if (params.sort.field === 'imageTitle') {
      expenses.sort((a, b) => {
        const aAttachments = a.KeihiAttachment[0]?.originalName || ''
        const bAttachments = b.KeihiAttachment[0]?.originalName || ''
        return params.sort.order === 'asc' ? aAttachments.localeCompare(bAttachments) : bAttachments.localeCompare(aAttachments)
      })
    }

    const totalCount = await prisma.keihiExpense.count({
      where: whereCondition,
    })

    return {
      success: true,
      data: {
        expenses,
        totalCount,
        totalPages: Math.ceil(totalCount / params.limit),
      },
    }
  } catch (error) {
    console.error('経費記録取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '取得に失敗しました',
    }
  }
}

// 経費記録詳細取得
export const getExpenseById = async (id: string) => {
  try {
    const expense = await prisma.keihiExpense.findUnique({
      where: {id},
      include: {
        KeihiAttachment: true,
      },
    })

    if (!expense) {
      return {success: false, error: '記録が見つかりません'}
    }

    return {success: true, data: expense}
  } catch (error) {
    console.error('経費記録詳細取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '取得に失敗しました',
    }
  }
}

// 経費記録更新
export const updateExpense = async (
  id: string,
  data: {
    // 基本情報
    date?: Date
    amount?: number
    subject?: string
    counterparty?: string
    participants?: string
    conversationPurpose?: string[]
    keywords?: string[]

    // 会話記録
    conversationSummary?: string
    summary?: string

    // 税務調査対応項目
    counterpartyContact?: string
    followUpPlan?: string
    businessOpportunity?: string
    competitorInfo?: string

    // AI生成情報
    insight?: string
    autoTags?: string[]
    status?: string | null

    // MoneyForward用情報
    mfSubject?: string
    mfSubAccount?: string
    mfTaxCategory?: string
    mfDepartment?: string
  }
) => {
  try {
    const expense = await prisma.keihiExpense.update({
      where: {id},
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        KeihiAttachment: true,
      },
    })

    return {success: true, data: expense}
  } catch (error) {
    console.error('記録更新エラー:', error)
    return {success: false, error: '記録の更新に失敗しました'}
  }
}

// 経費記録削除
export const deleteExpense = async (
  id: string
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    // 関連する添付ファイルも削除
    await prisma.keihiAttachment.deleteMany({
      where: {keihiExpenseId: id},
    })

    // 経費記録を削除
    await prisma.keihiExpense.delete({
      where: {id},
    })

    return {success: true}
  } catch (error) {
    console.error('経費記録削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '削除に失敗しました',
    }
  }
}

// 複数の経費記録を一括削除
export const deleteMultipleExpenses = async (
  ids: string[]
): Promise<{
  success: boolean
  deletedCount?: number
  error?: string
}> => {
  try {
    // 関連する添付ファイルも削除
    await prisma.keihiAttachment.deleteMany({
      where: {keihiExpenseId: {in: ids}},
    })

    // 経費記録を一括削除
    const result = await prisma.keihiExpense.deleteMany({
      where: {id: {in: ids}},
    })

    return {
      success: true,
      deletedCount: result.count,
    }
  } catch (error) {
    console.error('経費記録一括削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '一括削除に失敗しました',
    }
  }
}

// ファイルアップロード（S3使用）
export const uploadAttachment = async (
  formData: FormData
): Promise<{
  success: boolean
  data?: {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
  }
  error?: string
}> => {
  try {
    const file = formData.get('file') as File
    if (!file) {
      return {success: false, error: 'ファイルが選択されていません'}
    }

    // FileHandlerを使用してファイル検証
    const validation = FileHandler.validateFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      }
    }

    // ファイル名を生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || ''
    const filename = `keihi/${timestamp}_${randomString}.${extension}`

    // S3アップロード用のフォームデータ
    const s3FormData: S3FormData = {
      bucketKey: 'keihi', // フォルダ名
    }

    // S3にアップロード
    const uploadResult = await FileHandler.sendFileToS3({
      file,
      formDataObj: s3FormData,
      validateFile: false, // 既に検証済み
    })

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || 'S3アップロードに失敗しました',
      }
    }

    // S3のURLを取得（アップロード結果から）
    const s3Url = uploadResult.result?.url || `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/keihi/${filename}`

    // データベースに保存（expenseIdは後で関連付け）
    const attachment = await prisma.keihiAttachment.create({
      data: {
        filename: filename.split('/').pop() || filename, // ファイル名のみ
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: s3Url,
        // keihiExpenseIdは省略（nullableなので後で関連付け）
      },
    })

    return {
      success: true,
      data: {
        id: attachment.id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
        url: attachment.url,
      },
    }
  } catch (error) {
    console.error('ファイルアップロードエラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ファイルのアップロードに失敗しました',
    }
  }
}

// 添付ファイルを経費記録に関連付け
export const linkAttachmentsToExpense = async (
  expenseId: string,
  attachmentIds: string[]
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await prisma.keihiAttachment.updateMany({
      where: {
        id: {in: attachmentIds},
        keihiExpenseId: null, // 未関連付けのもののみ
      },
      data: {
        keihiExpenseId: expenseId,
      },
    })

    return {success: true}
  } catch (error) {
    console.error('添付ファイル関連付けエラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '添付ファイルの関連付けに失敗しました',
    }
  }
}

// 手動でrevalidateを実行するためのServer Action
export const revalidateKeihiPages = async (): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    return {success: true}
  } catch (error) {
    console.error('revalidateエラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'revalidateに失敗しました',
    }
  }
}

// 複数の経費記録を削除（エイリアス）
export const deleteExpenses = async (
  ids: string[]
): Promise<{
  success: boolean
  deletedCount?: number
  error?: string
}> => {
  return deleteMultipleExpenses(ids)
}

// 経費データCSV出力
export const exportExpensesToCsv = async (
  selectedIds?: string[]
): Promise<{
  success: boolean
  data?: string
  error?: string
}> => {
  try {
    const result =
      selectedIds && selectedIds.length > 0 ? await exportSelectedExpensesToCSV(selectedIds) : await exportAllExpensesToCSV()

    if (result.success) {
      return {
        success: true,
        data: result.csvData,
      }
    } else {
      return {
        success: false,
        error: result.error || '経費データのCSV出力に失敗しました',
      }
    }
  } catch (error) {
    console.error('経費データCSV出力エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '経費データのCSV出力に失敗しました',
    }
  }
}

// 取引先一覧CSV出力
export const exportLocationsToCsv = async (
  selectedIds?: string[]
): Promise<{
  success: boolean
  data?: string
  error?: string
}> => {
  try {
    const result =
      selectedIds && selectedIds.length > 0 ? await exportSelectedLocationsToCSV(selectedIds) : await exportAllLocationsToCSV()

    if (result.success) {
      return {
        success: true,
        data: result.csvData,
      }
    } else {
      return {
        success: false,
        error: result.error || '取引先一覧のCSV出力に失敗しました',
      }
    }
  } catch (error) {
    console.error('取引先一覧CSV出力エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '取引先一覧のCSV出力に失敗しました',
    }
  }
}

// 経費データをスプレッドシートに連携
export const syncExpensesToSheet = async (
  selectedIds?: string[]
): Promise<{
  success: boolean
  message: string
}> => {
  try {
    const result =
      selectedIds && selectedIds.length > 0
        ? await syncSelectedExpensesToSpreadsheet(selectedIds)
        : await syncAllExpensesToSpreadsheet()

    return result
  } catch (error) {
    console.error('経費データのスプレッドシート連携エラー:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '経費データのスプレッドシート連携に失敗しました',
    }
  }
}

// 取引先データをスプレッドシートに連携
export const syncLocationsToSheet = async (
  selectedIds?: string[]
): Promise<{
  success: boolean
  message: string
}> => {
  try {
    const result =
      selectedIds && selectedIds.length > 0
        ? await syncSelectedLocationsToSpreadsheet(selectedIds)
        : await syncAllLocationsToSpreadsheet()

    return result
  } catch (error) {
    console.error('取引先データのスプレッドシート連携エラー:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '取引先データのスプレッドシート連携に失敗しました',
    }
  }
}
