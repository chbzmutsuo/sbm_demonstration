'use client'

import React, {forwardRef} from 'react'
import {InvoiceData} from '@app/(apps)/tbm/(server-actions)/getInvoiceData'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

interface InvoiceDocumentProps {
  invoiceData: InvoiceData
}

export const InvoiceDocument = forwardRef<HTMLDivElement, InvoiceDocumentProps>(({invoiceData}, ref) => {
  const {companyInfo, customerInfo, invoiceDetails} = invoiceData
  const {yearMonth, totalAmount, taxAmount, grandTotal, summaryByCategory, detailsByCategory} = invoiceDetails

  return (
    <div ref={ref} className="bg-white text-black print-target">
      {/* 1ページ目: 請求書サマリー */}
      <div className="w-[210mm] min-h-[297mm] mx-auto p-8 page-break-after-always">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-center mb-6">請求書</h1>
            <div className="text-right text-sm mb-4">
              <div>{formatDate(new Date(), 'YYYY年MM月DD日')}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm mb-2">
              <div className="font-bold text-lg">{companyInfo.name}</div>
              <div className="mt-1">{companyInfo.address}</div>
              <div className="mt-1">
                TEL {companyInfo.tel} FAX {companyInfo.fax}
              </div>
              <div className="mt-2 text-xs whitespace-pre-line">{companyInfo.bankInfo}</div>
            </div>
          </div>
        </div>

        {/* 請求先情報 */}
        <div className="mb-6">
          <div className="text-lg font-bold">{customerInfo.name}</div>
          {customerInfo.address && <div className="text-sm">{customerInfo.address}</div>}
        </div>

        {/* 請求期間 */}
        <div className="mb-6">
          <div className="text-lg font-bold">{formatDate(yearMonth, 'YYYY年MM月')}分</div>
          <div className="text-sm">下記の通りご請求申し上げます。</div>
        </div>

        {/* 請求金額 */}
        <div className="mb-8">
          <div className="border border-gray-800 bg-gray-100">
            <div className="p-4">
              <div className="text-center">
                <div className="text-lg font-bold">ご請求金額（税込）</div>
                <div className="text-3xl font-bold">¥{grandTotal.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 明細サマリー */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 text-center">摘要</th>
                <th className="border border-gray-400 p-2 text-center">金額（税抜）</th>
              </tr>
            </thead>
            <tbody>
              {summaryByCategory.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-2">{item.category}</td>
                  <td className="border border-gray-400 p-2 text-right">{item.totalAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 合計 */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 bg-gray-100">合計（税抜）</td>
                <td className="border border-gray-400 p-2 text-right">¥{totalAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 bg-gray-100">消費税 10%</td>
                <td className="border border-gray-400 p-2 text-right">¥{taxAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 bg-gray-100 font-bold">総計（税込）</td>
                <td className="border border-gray-400 p-2 text-right font-bold">¥{grandTotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2ページ目以降: 便区分別詳細 */}
      {Object.entries(
        detailsByCategory.reduce(
          (acc, detail) => {
            if (!acc[detail.categoryCode]) {
              acc[detail.categoryCode] = []
            }
            acc[detail.categoryCode].push(detail)
            return acc
          },
          {} as Record<string, typeof detailsByCategory>
        )
      ).map(([categoryCode, details], pageIndex) => (
        <div
          key={categoryCode}
          className={`w-[210mm] min-h-[297mm] mx-auto p-8 ${
            pageIndex <
            Object.keys(
              detailsByCategory.reduce(
                (acc, detail) => {
                  if (!acc[detail.categoryCode]) {
                    acc[detail.categoryCode] = []
                  }
                  acc[detail.categoryCode].push(detail)
                  return acc
                },
                {} as Record<string, typeof detailsByCategory>
              )
            ).length -
              1
              ? 'page-break-after-always'
              : ''
          }`}
        >
          {/* ヘッダー */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold">{details[0].category} 明細</h2>
              <div className="text-sm">{formatDate(yearMonth, 'YYYY年MM月')}分</div>
            </div>
            <div className="text-right text-sm">
              <div>{companyInfo.name}</div>
              <div>TEL {companyInfo.tel}</div>
            </div>
          </div>

          {/* 詳細テーブル */}
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2">路線名</th>
                <th className="border border-gray-400 p-2">便名</th>
                <th className="border border-gray-400 p-2">回数</th>
                <th className="border border-gray-400 p-2">単価</th>
                <th className="border border-gray-400 p-2">運賃</th>
                <th className="border border-gray-400 p-2">通行料</th>
                <th className="border border-gray-400 p-2">合計</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-2">{detail.routeName}</td>
                  <td className="border border-gray-400 p-2">{detail.name}</td>
                  <td className="border border-gray-400 p-2 text-center">{detail.trips}</td>
                  <td className="border border-gray-400 p-2 text-right">{detail.unitPrice.toLocaleString()}</td>
                  <td className="border border-gray-400 p-2 text-right">{detail.amount.toLocaleString()}</td>
                  <td className="border border-gray-400 p-2 text-right">{detail.tollFee.toLocaleString()}</td>
                  <td className="border border-gray-400 p-2 text-right">{(detail.amount + detail.tollFee).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-400 p-2" colSpan={2}>
                  小計
                </td>
                <td className="border border-gray-400 p-2 text-center">
                  {details.reduce((sum, detail) => sum + detail.trips, 0)}
                </td>
                <td className="border border-gray-400 p-2"></td>
                <td className="border border-gray-400 p-2 text-right">
                  {details.reduce((sum, detail) => sum + detail.amount, 0).toLocaleString()}
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {details.reduce((sum, detail) => sum + detail.tollFee, 0).toLocaleString()}
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {details.reduce((sum, detail) => sum + detail.amount + detail.tollFee, 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      <style jsx>{`
        @media print {
          .page-break-after-always {
            page-break-after: always;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
})

InvoiceDocument.displayName = 'InvoiceDocument'
