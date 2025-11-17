'use server'

import {
  GoogleSheet_Read,
  GoogleSheet_Append,
  GoogleSheet_Update,
  GoogleSheet_getSheetByNameOrCreate,
} from '@app/api/google/actions/sheetAPI'

// スプレッドシートのID
const SPREADSHEET_ID = '1lZ5YDWz3kGHU-P7cxg4eMHWlF_0JdKTOhPvDeT3KG0o'

// シート名
const EXPENSE_SHEET_NAME = '経費_APP連携'
const LOCATION_SHEET_NAME = '取引先_APP連携'

/**
 * スプレッドシートの指定されたシートからデータを読み込む
 */
export const readSheetData = async (sheetName: string): Promise<string[][]> => {
  try {
    // シートが存在するか確認し、なければ作成
    await GoogleSheet_getSheetByNameOrCreate({
      spreadsheetId: SPREADSHEET_ID,
      sheetName,
    })

    // データを読み込む
    const response = await GoogleSheet_Read({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1000`,
    })

    return (response.values as string[][]) || []
  } catch (error) {
    console.error(`シートデータの読み込みエラー (${sheetName}):`, error)
    throw error
  }
}

/**
 * 経費データをスプレッドシートにUpsertする
 * @param data 経費データの配列（ヘッダー行を含む）
 * @param keyColumnIndex キー列のインデックス（expense.idが格納されている列）
 */
export const upsertExpenseData = async (
  data: string[][]
): Promise<{
  success: boolean
  message: string
  updatedCount: number
  insertedCount: number
}> => {
  try {
    // シートが存在するか確認し、なければ作成
    await GoogleSheet_getSheetByNameOrCreate({
      spreadsheetId: SPREADSHEET_ID,
      sheetName: EXPENSE_SHEET_NAME,
    })

    // 現在のシートデータを取得
    const currentData = await readSheetData(EXPENSE_SHEET_NAME)

    // ヘッダー行がない場合は追加
    if (currentData.length === 0) {
      await GoogleSheet_Append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${EXPENSE_SHEET_NAME}!A1`,
        values: [data[0]], // ヘッダー行のみ追加
      })
    }

    // 既存データを取得（ヘッダー行を除く）
    const existingData = currentData.length > 0 ? currentData.slice(1) : []

    // キー列のインデックスを特定（仕訳メモ列 = expense.id）
    const keyColumnIndex = data[0].findIndex(header => header === '仕訳メモ')
    if (keyColumnIndex === -1) {
      throw new Error('仕訳メモ列が見つかりません')
    }

    let updatedCount = 0
    let insertedCount = 0
    const dataToInsert: string[][] = []

    // ヘッダー行を除いたデータ行を処理
    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      const keyValue = row[keyColumnIndex]

      // 既存データに同じキーが存在するかチェック
      const existingRowIndex = existingData.findIndex(existingRow => {
        return existingRow[keyColumnIndex] === keyValue
      })

      if (existingRowIndex !== -1) {
        // 既存データを更新
        const rowNumber = existingRowIndex + 2 // ヘッダー行 + 1ベースのインデックス
        await GoogleSheet_Update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${EXPENSE_SHEET_NAME}!A${rowNumber}`,
          values: [row],
        })
        updatedCount++
      } else {
        // 新規データを追加用に保存
        dataToInsert.push(row)
      }
    }

    // 新規データをまとめて追加
    if (dataToInsert.length > 0) {
      await GoogleSheet_Append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${EXPENSE_SHEET_NAME}!A1`,
        values: dataToInsert,
      })
      insertedCount = dataToInsert.length
    }

    await GoogleSheet_Update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${EXPENSE_SHEET_NAME}!A1`,
      values: [[`=MAP(S:S,lambda(expenseId, XLOOKUP(expenseId, '経費_MFインポート'!Q:Q,'経費_MFインポート'!A:A,,false)))`]],
    })

    return {
      success: true,
      message: `${updatedCount}件更新、${insertedCount}件追加しました`,
      updatedCount,
      insertedCount,
    }
  } catch (error) {
    console.error('経費データのUpsertエラー:', error)
    throw error
  }
}

/**
 * 取引先データをスプレッドシートにUpsertする
 * @param data 取引先データの配列（ヘッダー行を含む）
 */
export const upsertLocationData = async (
  data: string[][]
): Promise<{
  success: boolean
  message: string
  updatedCount: number
  insertedCount: number
}> => {
  try {
    // シートが存在するか確認し、なければ作成
    await GoogleSheet_getSheetByNameOrCreate({
      spreadsheetId: SPREADSHEET_ID,
      sheetName: LOCATION_SHEET_NAME,
    })

    // 現在のシートデータを取得
    const currentData = await readSheetData(LOCATION_SHEET_NAME)

    // ヘッダー行がない場合は追加
    if (currentData.length === 0) {
      await GoogleSheet_Append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${LOCATION_SHEET_NAME}!A1`,
        values: [data[0]], // ヘッダー行のみ追加
      })
    }

    // 既存データを取得（ヘッダー行を除く）
    const existingData = currentData.length > 0 ? currentData.slice(1) : []

    // キー列のインデックスを特定（取引先名）
    const keyColumnIndex = data[0].findIndex(header => header === '取引先名')
    if (keyColumnIndex === -1) {
      throw new Error('取引先名列が見つかりません')
    }

    let updatedCount = 0
    let insertedCount = 0
    const dataToInsert: string[][] = []

    // ヘッダー行を除いたデータ行を処理
    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      const keyValue = row[keyColumnIndex]

      // 既存データに同じキーが存在するかチェック
      const existingRowIndex = existingData.findIndex(existingRow => {
        return existingRow[keyColumnIndex] === keyValue
      })

      if (existingRowIndex !== -1) {
        // 既存データを更新
        const rowNumber = existingRowIndex + 2 // ヘッダー行 + 1ベースのインデックス
        await GoogleSheet_Update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${LOCATION_SHEET_NAME}!A${rowNumber}`,
          values: [row],
        })
        updatedCount++
      } else {
        // 新規データを追加用に保存
        dataToInsert.push(row)
      }
    }

    // 新規データをまとめて追加
    if (dataToInsert.length > 0) {
      await GoogleSheet_Append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${LOCATION_SHEET_NAME}!A1`,
        values: dataToInsert,
      })
      insertedCount = dataToInsert.length
    }

    return {
      success: true,
      message: `${updatedCount}件更新、${insertedCount}件追加しました`,
      updatedCount,
      insertedCount,
    }
  } catch (error) {
    console.error('取引先データのUpsertエラー:', error)
    throw error
  }
}
