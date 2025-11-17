'use server'

import {generateMFCSV, generateLocationListCSV} from './csv-actions'
import {upsertExpenseData, upsertLocationData} from './google-sheet-actions'

/**
 * 経費データをスプレッドシートに連携する
 */
export const syncExpensesToSpreadsheet = async (
  expenseIds?: string[]
): Promise<{
  success: boolean
  message: string
}> => {
  try {
    // CSVデータを生成
    const csvResult = await generateMFCSV(expenseIds)
    if (!csvResult.success || !csvResult.csvData) {
      return {
        success: false,
        message: csvResult.error || '経費データの生成に失敗しました',
      }
    }

    // CSVデータを2次元配列に変換
    const rows = csvResult.csvData.split('\n').map(row => {
      // カンマで分割するが、引用符で囲まれた部分は保持する
      const result: string[] = []
      let inQuotes = false
      let currentValue = ''

      for (let i = 0; i < row.length; i++) {
        const char = row[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(currentValue)
          currentValue = ''
        } else {
          currentValue += char
        }
      }

      result.push(currentValue) // 最後の値を追加
      return result
    })

    // スプレッドシートにUpsert
    const upsertResult = await upsertExpenseData(rows)

    return {
      success: true,
      message: `経費データをスプレッドシートに連携しました: ${upsertResult.message}`,
    }
  } catch (error) {
    console.error('経費データのスプレッドシート連携エラー:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '経費データのスプレッドシート連携に失敗しました',
    }
  }
}

/**
 * 取引先データをスプレッドシートに連携する
 */
export const syncLocationsToSpreadsheet = async (
  expenseIds?: string[]
): Promise<{
  success: boolean
  message: string
}> => {
  try {
    // CSVデータを生成
    const csvResult = await generateLocationListCSV(expenseIds)
    if (!csvResult.success || !csvResult.csvData) {
      return {
        success: false,
        message: csvResult.error || '取引先データの生成に失敗しました',
      }
    }

    // BOMを削除
    const csvData = csvResult.csvData.replace(/^\uFEFF/, '')

    // CSVデータを2次元配列に変換
    const rows = csvData.split('\n').map(row => {
      // カンマで分割するが、引用符で囲まれた部分は保持する
      const result: string[] = []
      let inQuotes = false
      let currentValue = ''

      for (let i = 0; i < row.length; i++) {
        const char = row[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(currentValue)
          currentValue = ''
        } else {
          currentValue += char
        }
      }

      result.push(currentValue) // 最後の値を追加
      return result
    })

    // スプレッドシートにUpsert
    const upsertResult = await upsertLocationData(rows)

    return {
      success: true,
      message: `取引先データをスプレッドシートに連携しました: ${upsertResult.message}`,
    }
  } catch (error) {
    console.error('取引先データのスプレッドシート連携エラー:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '取引先データのスプレッドシート連携に失敗しました',
    }
  }
}

/**
 * 全ての経費データをスプレッドシートに連携する
 */
export const syncAllExpensesToSpreadsheet = async (): Promise<{
  success: boolean
  message: string
}> => {
  return syncExpensesToSpreadsheet()
}

/**
 * 選択した経費データをスプレッドシートに連携する
 */
export const syncSelectedExpensesToSpreadsheet = async (
  expenseIds: string[]
): Promise<{
  success: boolean
  message: string
}> => {
  return syncExpensesToSpreadsheet(expenseIds)
}

/**
 * 全ての取引先データをスプレッドシートに連携する
 */
export const syncAllLocationsToSpreadsheet = async (): Promise<{
  success: boolean
  message: string
}> => {
  return syncLocationsToSpreadsheet()
}

/**
 * 選択した取引先データをスプレッドシートに連携する
 */
export const syncSelectedLocationsToSpreadsheet = async (
  expenseIds: string[]
): Promise<{
  success: boolean
  message: string
}> => {
  return syncLocationsToSpreadsheet(expenseIds)
}


