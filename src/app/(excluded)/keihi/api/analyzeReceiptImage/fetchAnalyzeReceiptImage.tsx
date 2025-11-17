import {basePath} from '@cm/lib/methods/common'

// 一括登録用の基本レコード作成
// fileNameList はアップロード元のオリジナルファイル名を保持して送る
export const fetchAnalyzeReceiptImage = async (
  imageDataList: string[],
  fileNameList?: string[]
): Promise<createBulkExpensesBasicReturn> => {
  const apiPath = `${basePath}/keihi/api/analyzeReceiptImage`
  const payload = {imageDataList, fileNameList}
  const result = await fetch(apiPath, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => res.json())

  return result
}

export type createBulkExpensesBasicReturn = {
  success: boolean
  data?: Array<{
    id: string
    date: string
    amount: number
    mfSubject: string // 統合された科目フィールド
    participants: string
    keywords: string[]
    imageIndex: number
    recordCreated: boolean
    imageUploaded: boolean
    errors: string[]
  }>
  summary?: {
    totalImages: number
    recordsCreated: number
    imagesUploaded: number
    failedRecords: number
    failedImages: number
  }
  error?: string
}
