'use server'

import prisma from 'src/lib/prisma'

export interface MFJournalEntry {
  取引No: string
  取引日: string
  借方勘定科目: string
  借方補助科目: string
  借方部門: string
  借方取引先: string
  借方税区分: string
  借方インボイス: string
  '借方金額(円)': number
  借方税額: number
  貸方勘定科目: string
  貸方補助科目: string
  貸方部門: string
  貸方取引先: string
  貸方税区分: string
  貸方インボイス: string
  '貸方金額(円)': number
  貸方税額: number
  摘要: string
  仕訳メモ: string
  タグ: string
  MF仕訳タイプ: string
  決算整理仕訳: string
  作成日時: string
  作成者: string
  最終更新日時: string
  最終更新者: string
}

// MoneyForward用CSV生成
export async function generateMFCSV(expenseIds?: string[]): Promise<{
  success: boolean
  csvData?: string
  error?: string
}> {
  try {
    const whereClause = expenseIds ? {id: {in: expenseIds}} : {}

    const expenses = await prisma.keihiExpense.findMany({
      where: whereClause,
      orderBy: {date: 'desc'},
    })

    if (expenses.length === 0) {
      return {success: false, error: '出力対象の記録がありません'}
    }

    // CSVヘッダー
    const headers = [
      '取引No',
      '取引日',
      '借方勘定科目',
      '借方補助科目',
      '借方部門',
      '借方取引先',
      '借方税区分',
      '借方インボイス',
      '借方金額(円)',
      '借方税額',
      '貸方勘定科目',
      '貸方補助科目',
      '貸方部門',
      '貸方取引先',
      '貸方税区分',
      '貸方インボイス',
      '貸方金額(円)',
      '貸方税額',
      '摘要',
      '仕訳メモ',
      'タグ',
      'MF仕訳タイプ',
      '決算整理仕訳',
      '作成日時',
      '作成者',
      '最終更新日時',
      '最終更新者',
    ]

    // CSVデータ生成
    const csvRows = expenses.map((expense, index) => {
      const transactionNo = (index + 1).toString()
      const date = expense.date.toISOString().split('T')[0].replace(/-/g, '/')
      const tags = expense.autoTags.join('|')

      return [
        '',
        date,
        expense.mfSubject || '', // 借方勘定科目
        '', // 借方補助科目
        expense.mfDepartment || '', // 借方部門
        expense.counterparty || '', // 借方取引先
        expense.mfTaxCategory || '課仕 10%', // 借方税区分
        '', // 借方インボイス
        expense.amount, // 借方金額
        '', // 借方税額
        '事業主借', // 貸方勘定科目（固定）
        '', // 貸方補助科目
        '', // 貸方部門
        '', // 貸方取引先
        '', // 貸方税区分（固定）
        '', // 貸方インボイス
        expense.amount, // 貸方金額
        '', // 貸方税額
        [expense.summary, `【ID:${expense.id}】`].filter(Boolean).join(' | ') || '',
        expense.id, // 仕分けメモ（keihiId）
        '', // タグ
        '', // MF仕訳タイプ
        '', // 決算整理仕訳
        '', // 作成日時
        '', // 作成者
        '', // 最終更新日時
        '', // 最終更新者
      ]
    })

    // CSV文字列生成
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row =>
        row
          .map(cell => {
            // 文字列の場合はダブルクォートで囲む
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
              return `"${cell.replace(/"/g, '""')}"`
            }
            return cell
          })
          .join(',')
      ),
    ].join('\n')

    return {
      success: true,
      csvData: csvContent,
    }
  } catch (error) {
    console.error('CSV生成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'CSV生成に失敗しました',
    }
  }
}

// 全件CSV出力
export async function exportAllExpensesToCSV() {
  return await generateMFCSV()
}

// 選択した記録のCSV出力
export async function exportSelectedExpensesToCSV(expenseIds: string[]) {
  return await generateMFCSV(expenseIds)
}

// 取引先一覧のCSV出力
export async function generateLocationListCSV(expenseIds?: string[]): Promise<{
  success: boolean
  csvData?: string
  error?: string
}> {
  try {
    const whereClause = expenseIds ? {id: {in: expenseIds}} : {}

    // 経費データから取引先情報を取得
    const expenses = await prisma.keihiExpense.findMany({
      where: whereClause,
      select: {
        counterparty: true,
      },
      distinct: ['counterparty'],
      orderBy: {
        counterparty: 'asc',
      },
    })

    if (expenses.length === 0) {
      return {success: false, error: '出力対象の取引先がありません'}
    }

    // 空の取引先名を除外し、重複を削除
    const uniqueLocations = [...new Set(expenses.map(e => e.counterparty).filter(Boolean))]

    // CSVヘッダー
    const headers = [
      //
      'コード',
      '取引先名',
      '検索キー',
      '表示設定',
      '登録番号',
      '法人番号',
    ]

    // CSVデータ生成
    const csvRows = uniqueLocations.map(counterparty => {
      return [
        '', // コードは空白
        counterparty, // 取引先名
        '', // 検索キー（不要）
        '1', // 表示設定は1
        '', // 登録番号（不要）
        '', // 法人番号（不要）
      ]
    })

    // CSV文字列生成
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row =>
        row
          .map(cell => {
            // 文字列の場合はダブルクォートで囲む
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
              return `"${cell.replace(/"/g, '""')}"`
            }
            return cell
          })
          .join(',')
      ),
    ].join('\n')

    // BOMを追加してExcelで正しく表示されるようにする
    const csvWithBom = '\uFEFF' + csvContent

    return {
      success: true,
      csvData: csvWithBom,
    }
  } catch (error) {
    console.error('取引先一覧CSV生成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '取引先一覧CSV生成に失敗しました',
    }
  }
}

// 全件の取引先一覧CSV出力
export async function exportAllLocationsToCSV() {
  return await generateLocationListCSV()
}

// 選択した記録の取引先一覧CSV出力
export async function exportSelectedLocationsToCSV(expenseIds: string[]) {
  return await generateLocationListCSV(expenseIds)
}
