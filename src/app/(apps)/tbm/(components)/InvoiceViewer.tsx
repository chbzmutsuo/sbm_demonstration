'use client'

import React, {useRef, useState} from 'react'
import {useReactToPrint} from 'react-to-print'
import {InvoiceDocument, InvoiceDocumentRef} from './InvoiceDocument'
import {InvoiceData, CategoryDetail} from '@app/(apps)/tbm/(server-actions)/getInvoiceData'
import {Button} from '@cm/components/styles/common-components/Button'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {toast} from 'react-toastify'
import {resetInvoiceManualEdit, saveInvoiceManualEdit} from '@app/(apps)/tbm/(server-actions)/invoiceManualEdit'
import {useRouter} from 'next/navigation'
import {getInvoiceData} from '@app/(apps)/tbm/(server-actions)/getInvoiceData'

interface InvoiceViewerProps {
  invoiceData: InvoiceData
  customerId: number
}

export default function InvoiceViewer({invoiceData, customerId}: InvoiceViewerProps) {
  const componentRef = useRef<HTMLDivElement>(null)
  const invoiceDocumentRef = useRef<InvoiceDocumentRef>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `請求書_${formatDate(invoiceData.invoiceDetails.yearMonth, 'YYYY年MM月')}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .page-break-after-always {
          page-break-after: always !important;
        }
      }
    `,
  })

  const handleSave = async (summaryByCategory: any[], detailsByCategory: any[]) => {
    setIsSaving(true)
    try {
      await saveInvoiceManualEdit({
        tbmCustomerId: customerId,
        yearMonth: invoiceData.invoiceDetails.yearMonth,
        summaryByCategory,
        detailsByCategory,
      })
      toast.success('編集内容を保存しました')
      router.refresh()
    } catch (error) {
      console.error('保存エラー:', error)
      toast.error('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToDriveData = async () => {
    if (!confirm('手動編集を削除して配車連動データに戻しますか？')) {
      return
    }

    setIsResetting(true)
    try {
      await resetInvoiceManualEdit({
        tbmCustomerId: customerId,
        yearMonth: invoiceData.invoiceDetails.yearMonth,
      })
      toast.success('配車連動データに戻しました')
      router.refresh()
    } catch (error) {
      console.error('配車連動データへのリセットエラー:', error)
      toast.error('配車連動データへのリセットに失敗しました')
    } finally {
      setIsResetting(false)
    }
  }

  // 特定の行を配車連動データにリセット
  const handleResetDetail = async (detail: CategoryDetail): Promise<CategoryDetail | null> => {
    try {
      // 年月からwhereQueryを作成
      const yearMonth = invoiceData.invoiceDetails.yearMonth
      const year = yearMonth.getFullYear()
      const month = yearMonth.getMonth() + 1
      const gte = new Date(year, month - 1, 1)
      const lte = new Date(year, month, 0, 23, 59, 59)

      // 最新の配車連動データを取得
      const freshInvoiceData = await getInvoiceData({
        whereQuery: {gte, lte},
        customerId,
      })

      // 同じ路線名・便名の行を探す
      const resetDetail = freshInvoiceData.invoiceDetails.detailsByCategory.find(
        d => d.routeName === detail.routeName && d.name === detail.name && d.categoryCode === detail.categoryCode
      )

      if (resetDetail) {
        toast.success('配車連動データに戻しました')
        return resetDetail
      } else {
        toast.warning('該当する配車連動データが見つかりませんでした')
        return null
      }
    } catch (error) {
      console.error('リセットエラー:', error)
      toast.error('リセットに失敗しました')
      return null
    }
  }

  return (
    <div className="space-y-4">
      {/* 操作ボタン */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg no-print">
        <Button onClick={handlePrint} className="bg-blue-600 text-white hover:bg-blue-700">
          PDF出力・印刷
        </Button>
        <Button
          onClick={handleResetToDriveData}
          disabled={isResetting}
          className="bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-400"
        >
          {isResetting ? 'リセット中...' : '配車連動データに戻す'}
        </Button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>対象期間:</span>
          <span className="font-semibold">{formatDate(invoiceData.invoiceDetails.yearMonth, 'YYYY年MM月')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>請求先:</span>
          <span className="font-semibold">{invoiceData.customerInfo.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>合計金額:</span>
          <span className="font-semibold text-lg">¥{invoiceData.invoiceDetails.grandTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* プレビュー */}
      <div ref={componentRef} className="border border-gray-300 rounded-lg overflow-hidden shadow-lg ">
        <InvoiceDocument
          ref={invoiceDocumentRef}
          invoiceData={invoiceData}
          onSave={handleSave}
          onResetDetail={handleResetDetail}
        />
      </div>

      {/* <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style> */}
    </div>
  )
}
