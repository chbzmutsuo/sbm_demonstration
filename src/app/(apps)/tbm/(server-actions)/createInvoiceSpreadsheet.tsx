'use server'

import {GoogleSheet_copy, GoogleSheet_Update, GoogleSheet_getSheetByNameOrCreate} from '@app/api/google/actions/sheetAPI'
import {InvoiceData, CategoryDetail} from './getInvoiceData'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

// 設定値
const TEMPLATE_SPREADSHEET_ID = '1boTm_Ipdp0ZZBlc2XdlZLa4tpefm0DnD-Y61yglN-iY'
const DESTINATION_FOLDER_ID = '1dk-SsCausKGN0jV5rEnYKJRYCVC4wgF5'

export type SpreadsheetExportResult = {
  success: boolean
  spreadsheetId?: string
  spreadsheetUrl?: string
  message: string
  error?: string
}

export const createInvoiceSpreadsheet = async (invoiceData: InvoiceData): Promise<SpreadsheetExportResult> => {
  try {
    const {customerInfo, invoiceDetails} = invoiceData
    const {yearMonth} = invoiceDetails

    // ファイル名を生成: "YYYY年MM月_顧客名"
    const fileName = `${formatDate(yearMonth, 'YYYY年MM月')}_${customerInfo.name}`

    // テンプレートスプレッドシートをコピー
    const copyResult = await GoogleSheet_copy({
      fromSSId: TEMPLATE_SPREADSHEET_ID,
      destinationFolderId: DESTINATION_FOLDER_ID,
      fileName: fileName,
    })

    if (!copyResult.id) {
      throw new Error('スプレッドシートのコピーに失敗しました')
    }

    const newSpreadsheetId = copyResult.id

    // 請求書表紙シートの更新
    await updateCoverSheet(newSpreadsheetId, invoiceData)

    // 区分別シートの作成と更新
    await createCategorySheets(newSpreadsheetId, invoiceData)

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`

    return {
      success: true,
      spreadsheetId: newSpreadsheetId,
      spreadsheetUrl: spreadsheetUrl,
      message: `請求書スプレッドシートを作成しました: ${fileName}`,
    }
  } catch (error) {
    console.error('スプレッドシート作成エラー:', error)
    return {
      success: false,
      message: 'スプレッドシートの作成に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー',
    }
  }
}

// 請求書表紙シートの更新
async function updateCoverSheet(spreadsheetId: string, invoiceData: InvoiceData) {
  const {customerInfo, invoiceDetails, companyInfo} = invoiceData
  const {yearMonth, summaryByCategory, totalAmount, taxAmount, grandTotal} = invoiceDetails

  // 請求書表紙シートの更新データ（添付画像の黄色セルに基づく）
  const coverUpdates = [
    // 日付（H4セル - 画像右上の日付部分）
    {
      range: '請求書表紙!H4',
      values: [[formatDate(new Date(), 'YYYY年MM月DD日')]],
    },
    // 顧客名（A9セル - 画像左側の宛先部分）
    {
      range: '請求書表紙!A9',
      values: [[customerInfo.name]],
    },
    // 請求期間（A13セル - 画像の期間表示部分）
    {
      range: '請求書表紙!A13',
      values: [[`${formatDate(yearMonth, 'YYYY年MM月')}分`]],
    },
    // 会社情報（右上部分、F3からF8）
    {
      range: '請求書表紙!F3:F8',
      values: [
        [companyInfo.name],
        [companyInfo.address],
        [`TEL ${companyInfo.tel}`],
        [`FAX ${companyInfo.fax}`],
        [''],
        [companyInfo.bankInfo],
      ],
    },
    // 合計金額（C17セル - 画像の大きな金額表示部分）
    {
      range: '請求書表紙!C17',
      values: [[grandTotal]],
    },
  ]

  // 区分別明細（A22から開始 - 画像の明細表部分）
  const categoryRows = summaryByCategory.map((category, index) => [category.category, category.totalAmount])

  if (categoryRows.length > 0) {
    coverUpdates.push({
      range: `請求書表紙!A22:B${21 + categoryRows.length}`,
      values: categoryRows,
    })
  }

  // 合計行（区分明細の下、画像の合計部分）
  const summaryStartRow = 22 + summaryByCategory.length + 1
  coverUpdates.push(
    {
      range: `請求書表紙!A${summaryStartRow}:B${summaryStartRow}`,
      values: [['合計（税抜）', totalAmount]],
    },
    {
      range: `請求書表紙!A${summaryStartRow + 1}:B${summaryStartRow + 1}`,
      values: [['消費税 10%', taxAmount]],
    },
    {
      range: `請求書表紙!A${summaryStartRow + 2}:B${summaryStartRow + 2}`,
      values: [['総計（税込）', grandTotal]],
    }
  )

  // 一括更新実行
  for (const update of coverUpdates) {
    await GoogleSheet_Update({
      spreadsheetId,
      range: update.range,
      values: update.values,
    })
  }
}

// 区分別シートの作成と更新
async function createCategorySheets(spreadsheetId: string, invoiceData: InvoiceData) {
  const {invoiceDetails, customerInfo, companyInfo} = invoiceData
  const {detailsByCategory, yearMonth} = invoiceDetails

  // 区分ごとにグループ化
  const categoryGroups = detailsByCategory.reduce(
    (acc, detail) => {
      if (!acc[detail.categoryCode]) {
        acc[detail.categoryCode] = []
      }
      acc[detail.categoryCode].push(detail)
      return acc
    },
    {} as Record<string, CategoryDetail[]>
  )

  // 各区分でシートを作成
  for (const [categoryCode, details] of Object.entries(categoryGroups)) {
    const categoryName = details[0].category
    const sheetName = `請求書_${categoryName}`

    // テンプレートシートをコピーして新しいシートを作成
    await GoogleSheet_getSheetByNameOrCreate({
      spreadsheetId,
      sheetName,
    })

    // シートのヘッダー情報を更新（画像の黄色セルに基づく）
    const headerUpdates = [
      // 区分名（A2 - 画像のタイトル部分）
      {
        range: `${sheetName}!A2`,
        values: [[`${categoryName} 明細`]],
      },
      // 期間（A3 - 画像の期間表示部分）
      {
        range: `${sheetName}!A3`,
        values: [[`${formatDate(yearMonth, 'YYYY年MM月')}分`]],
      },
      // 会社情報（右上、F2:F4）
      {
        range: `${sheetName}!F2:F4`,
        values: [[companyInfo.name], [`TEL ${companyInfo.tel}`], ['']],
      },
    ]

    // 明細データ（A8から開始 - 画像の明細表部分）
    const detailRows = details.map(detail => [
      detail.routeName, // A列: 路線名
      detail.trips.toString(), // B列: 回数
      detail.unitPrice?.toString() || '0', // C列: 単価
      detail.amount.toString(), // D列: 運賃
      detail.tollFee.toString(), // E列: 通行料
      (detail.amount + detail.tollFee).toString(), // F列: 合計
    ])

    if (detailRows.length > 0) {
      headerUpdates.push({
        range: `${sheetName}!A8:F${7 + detailRows.length}`,
        values: detailRows,
      })
    }

    // 小計行（明細の下）
    const subtotalRow = 8 + details.length
    const totalTrips = details.reduce((sum, detail) => sum + detail.trips, 0)
    const totalAmount = details.reduce((sum, detail) => sum + detail.amount, 0)
    const totalTollFee = details.reduce((sum, detail) => sum + detail.tollFee, 0)
    const grandTotalForCategory = totalAmount + totalTollFee

    headerUpdates.push({
      range: `${sheetName}!A${subtotalRow}:F${subtotalRow}`,
      values: [
        ['小計', totalTrips.toString(), '', totalAmount.toString(), totalTollFee.toString(), grandTotalForCategory.toString()],
      ],
    })

    // 一括更新実行
    for (const update of headerUpdates) {
      await GoogleSheet_Update({
        spreadsheetId,
        range: update.range,
        values: update.values,
      })
    }
  }
}
