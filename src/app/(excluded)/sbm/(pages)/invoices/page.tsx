'use client'

import React, {useState, useEffect} from 'react'

import {Printer, FileText, CheckSquare, Square} from 'lucide-react'
import {getReservations} from '../../actions'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight, toUtc} from '@cm/class/Days/date-utils/calculations'
import {Days} from '@cm/class/Days/Days'
import {FilterSection, useFilterForm} from '@cm/components/utils/FilterSection'

const today = getMidnight()
export default function InvoicesPage() {
  const [reservations, setReservations] = useState<ReservationType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReservations, setSelectedReservations] = useState<Set<number>>(new Set())

  // フィルターフォームの状態管理
  const defaultFilters = {
    date: formatDate(today),
  }

  const {
    formValues: filterValues,
    setFormValues: setFilterValues,
    resetForm: resetFilterForm,
    handleInputChange: handleFilterInputChange,
  } = useFilterForm(defaultFilters)

  // 現在適用されているフィルター
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)

  useEffect(() => {
    loadReservations()
  }, [appliedFilters])

  const loadReservations = async () => {
    setLoading(true)

    try {
      // 単日指定
      const selectedDate = new Date(appliedFilters.date)
      const nextDay = Days.day.add(selectedDate, 1)

      const where = {
        deliveryDate: {
          gte: toUtc(formatDate(selectedDate)),
          lt: toUtc(formatDate(nextDay)),
        },
      }

      const data = await getReservations(where)

      setReservations(data as unknown as ReservationType[])
    } catch (error) {
      console.error('予約データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // フィルターを適用する
  const applyFilters = () => {
    setAppliedFilters({...filterValues})
  }

  // フィルターをクリアする
  const clearFilters = () => {
    resetFilterForm()
    setAppliedFilters(defaultFilters)
  }

  // 日付フィルターのみなので追加のフィルタリングは不要
  const filteredReservations = reservations

  const toggleReservationSelection = (sbmReservationId: number) => {
    const newSelected = new Set(selectedReservations)
    if (newSelected.has(sbmReservationId)) {
      newSelected.delete(sbmReservationId)
    } else {
      newSelected.add(sbmReservationId)
    }
    setSelectedReservations(newSelected)
  }

  const toggleAllSelection = () => {
    if (selectedReservations.size === filteredReservations.length) {
      setSelectedReservations(new Set())
    } else {
      setSelectedReservations(new Set(filteredReservations.map(r => r.id!)))
    }
  }

  const handlePrintSelected = () => {
    if (selectedReservations.size === 0) {
      alert('印刷する伝票を選択してください')
      return
    }

    const selectedData = reservations.filter(r => selectedReservations.has(r.id!))
    generateInvoices(selectedData)
  }

  const handlePrintAll = () => {
    if (filteredReservations.length === 0) {
      alert('印刷する伝票がありません')
      return
    }

    generateInvoices(filteredReservations)
  }

  const generateInvoices = (reservationsData: ReservationType[]) => {
    // 印刷設定の確認メッセージ
    const confirmPrint = window.confirm(
      '印刷設定の確認：\n\n' +
        '• 用紙サイズ: A4\n' +
        '• ヘッダーとフッター: 無効\n' +
        '• 余白: 標準またはカスタム\n\n' +
        '印刷ダイアログでこれらの設定を確認してから印刷してください。\n\n' +
        '印刷を続けますか？'
    )

    if (!confirmPrint) return

    // 印刷用HTMLを生成
    const invoiceHTML = generateInvoiceHTML(reservationsData)

    // 新しいウィンドウで印刷プレビューを表示
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(invoiceHTML)
      printWindow.document.close()
      printWindow.focus()

      // 少し待ってから印刷ダイアログを開く（コンテンツが完全に読み込まれるまで）
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const generateInvoiceHTML = (reservationsData: ReservationType[]) => {
    const invoicesHTML = reservationsData
      .map(
        reservation => `
      <div class="invoice-page" style="page-break-after: always; font-family: 'Noto Sans JP', sans-serif;">
        <div class="invoice-border">
          <!-- 伝票ヘッダー -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
            <div>
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">配達伝票</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px;">弁当予約Pro</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 14px;">伝票No: <strong>${reservation.id}</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 14px;">印刷日: ${formatDate(new Date())}</p>
            </div>
          </div>

          <!-- 顧客情報 -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">顧客情報</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 5px 0;"><strong>会社・団体名:</strong> ${reservation.customerName}</p>
                <p style="margin: 5px 0;"><strong>担当者:</strong> ${reservation.contactName || '-'}</p>
                <p style="margin: 5px 0;"><strong>電話番号:</strong> ${reservation.phoneNumber}</p>
              </div>
              <div>
                <p style="margin: 5px 0;"><strong>配達先住所:</strong></p>
                <p style="margin: 5px 0; padding-left: 10px;">${reservation.postalCode} ${reservation.prefecture} ${reservation.city} ${reservation.street} ${reservation.building}</p>
              </div>
            </div>
          </div>

          <!-- 注文情報 -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">注文情報</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 5px 0;"><strong>配達日時:</strong> ${formatDate(reservation.deliveryDate!, 'YYYY/MM/DD HH:mm')}</p>
                <p style="margin: 5px 0;"><strong>受取方法:</strong> ${reservation.pickupLocation}</p>
                <p style="margin: 5px 0;"><strong>用途:</strong> ${reservation.purpose}</p>
              </div>
              <div>
                <p style="margin: 5px 0;"><strong>支払方法:</strong> ${reservation.paymentMethod}</p>
                <p style="margin: 5px 0;"><strong>注文経路:</strong> ${reservation.orderChannel}</p>
                <p style="margin: 5px 0;"><strong>担当者:</strong> ${reservation.orderStaff}</p>
              </div>
            </div>
          </div>

          <!-- 商品明細 -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">商品明細</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #333;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="border: 1px solid #333; padding: 8px; text-align: left;">商品名</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: center;">数量</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: right;">単価</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: right;">小計</th>
                </tr>
              </thead>
              <tbody>
                ${
                  reservation.items
                    ?.map(
                      item => `
                  <tr>
                    <td style="border: 1px solid #333; padding: 8px;">${item.productName}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: center;">${item.quantity}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: right;">¥${item.unitPrice?.toLocaleString()}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: right;">¥${item.totalPrice?.toLocaleString()}</td>
                  </tr>
                `
                    )
                    .join('') || ''
                }
              </tbody>
            </table>
          </div>

          <!-- 金額計算 -->
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: flex-end;">
              <div style="width: 300px;">
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ccc;">
                  <span>小計:</span>
                  <span>¥${reservation.totalAmount?.toLocaleString()}</span>
                </div>
                ${
                  reservation.pointsUsed
                    ? `
                  <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ccc;">
                    <span>ポイント使用:</span>
                    <span>-¥${reservation.pointsUsed.toLocaleString()}</span>
                  </div>
                `
                    : ''
                }
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; font-weight: bold; border-top: 2px solid #333;">
                  <span>合計金額:</span>
                  <span>¥${reservation.finalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 備考・特記事項 -->
          ${
            reservation.notes
              ? `
            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">備考</h3>
              <p style="margin: 0; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">${reservation.notes}</p>
            </div>
          `
              : ''
          }

          <!-- フッター -->
          <div style="position: absolute; bottom: 40px; left: 40px; right: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #333; padding-top: 15px;">
              <div>
                <p style="margin: 0; font-size: 12px;">弁当予約Pro - 配達管理システム</p>
              </div>
              <div style="text-align: right;">
                <div style="display: flex; gap: 30px;">
                  <div>
                    <p style="margin: 0; font-size: 12px;">配達完了サイン</p>
                    <div style="width: 100px; height: 40px; border: 1px solid #333; margin-top: 5px;"></div>
                  </div>
                  <div>
                    <p style="margin: 0; font-size: 12px;">回収完了サイン</p>
                    <div style="width: 100px; height: 40px; border: 1px solid #333; margin-top: 5px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>配達伝票 - 弁当予約Pro</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');
          @page {
            size: A4;
            margin: 15mm 20mm 15mm 20mm; /* 上下15mm、左右20mmのマージンを設定 */
          }
          @media print {
            /* ブラウザのデフォルトヘッダー/フッターを非表示にする */
            @page {
              margin: 15mm 20mm 15mm 20mm;
            }
            /* 印刷時の余分な要素を非表示 */
            body {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Noto Sans JP', sans-serif;
            font-size: 12px;
            line-height: 1.4;
          }
          .invoice-page {
            /* 四隅の余白を確保するため、さらに内側にパディングを追加 */
            padding: 15px !important;
            box-sizing: border-box;
          }
          .invoice-page:last-child {
            page-break-after: avoid !important;
          }
          /* 印刷時の境界線調整 */
          .invoice-border {
            border: 2px solid #333;
            padding: 15px;
            height: calc(100vh - 60px); /* 上下のパディング分を引く */
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        ${invoicesHTML}
      </body>
      </html>
    `
  }

  const exportToCSV = () => {
    if (filteredReservations.length === 0) {
      alert('エクスポートするデータがありません')
      return
    }

    const csvData = [
      ['伝票No', '顧客名', '担当者', '電話番号', '配達日時', '受取方法', '用途', '支払方法', '合計金額', '担当スタッフ'],
      ...filteredReservations.map(r => [
        r.id,
        r.customerName,
        r.contactName || '',
        r.phoneNumber,
        formatDate(r.deliveryDate!, 'YYYY/MM/DD HH:mm'),
        r.pickupLocation,
        r.purpose,
        r.paymentMethod,
        r.finalAmount,
        r.orderStaff,
      ]),
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `配達伝票一覧_${appliedFilters.date}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Printer className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">伝票印刷</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePrintSelected}
              disabled={selectedReservations.size === 0}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Printer size={20} />
              <span>選択分印刷 ({selectedReservations.size})</span>
            </button>
            <button
              onClick={handlePrintAll}
              disabled={filteredReservations.length === 0}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileText size={20} />
              <span>全件印刷</span>
            </button>
            {/* <button
              onClick={exportToCSV}
              disabled={filteredReservations.length === 0}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={20} />
              <span>CSV出力</span>
            </button> */}
          </div>
        </div>

        {/* フィルター */}
        <FilterSection onApply={applyFilters} onClear={clearFilters} title="伝票検索">
          <div className="flex justify-center">
            <div className="w-64">
              <label className="block text-xs font-medium text-gray-700 mb-1">日付</label>
              <input
                type="date"
                name="date"
                value={filterValues.date}
                onChange={handleFilterInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </FilterSection>

        {/* 予約一覧 */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">印刷対象一覧 ({filteredReservations.length}件)</h2>
            <button onClick={toggleAllSelection} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
              {selectedReservations.size === filteredReservations.length ? <CheckSquare size={20} /> : <Square size={20} />}
              <span>全選択</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">選択</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">伝票No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配達日時</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">担当者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">受取方法</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">合計金額</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">担当スタッフ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map(reservation => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleReservationSelection(reservation.id!)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {selectedReservations.has(reservation.id!) ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">#{reservation.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(reservation.deliveryDate!, 'YYYY/MM/DD HH:mm')}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{reservation.customerName}</td>
                    <td className="px-6 py-4 text-gray-900">{reservation.contactName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          reservation.pickupLocation === '配達' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {reservation.pickupLocation}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">¥{reservation.finalAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-900">{reservation.orderStaff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReservations.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">印刷対象の予約データがありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
