'use client'

import React, {forwardRef, useState, useImperativeHandle} from 'react'
import {InvoiceData, CategorySummary, CategoryDetail, PriceVariation} from '@app/(apps)/tbm/(server-actions)/getInvoiceData'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Button} from '@cm/components/styles/common-components/Button'
import {cn} from '@cm/shadcn/lib/utils'
import {Trash2, RotateCcw} from 'lucide-react'

const showUnitPrice = false

interface InvoiceDocumentProps {
  invoiceData: InvoiceData
  onSave?: (summaryByCategory: CategorySummary[], detailsByCategory: CategoryDetail[]) => void
  onResetDetail?: (detail: CategoryDetail) => Promise<CategoryDetail | null>
}

export interface InvoiceDocumentRef {
  getEditedData: () => {
    summaryByCategory: CategorySummary[]
    detailsByCategory: CategoryDetail[]
  }
}

export const InvoiceDocument = forwardRef<InvoiceDocumentRef, InvoiceDocumentProps>(
  ({invoiceData, onSave, onResetDetail}, ref) => {
    const {companyInfo, customerInfo, invoiceDetails} = invoiceData
    const {
      yearMonth,
      totalAmount: initialTotalAmount,
      taxAmount: initialTaxAmount,
      grandTotal: initialGrandTotal,
      summaryByCategory: initialSummaryByCategory,
      detailsByCategory: initialDetailsByCategory,
    } = invoiceDetails

    const [summaryByCategory, setSummaryByCategory] = useState<CategorySummary[]>(initialSummaryByCategory)
    const [detailsByCategory, setDetailsByCategory] = useState<CategoryDetail[]>(initialDetailsByCategory)

    useImperativeHandle(ref, () => ({
      getEditedData: () => ({
        summaryByCategory,
        detailsByCategory,
      }),
    }))

    // 合計金額を再計算
    const recalculateTotals = (summary: CategorySummary[]) => {
      const totalAmount = summary.reduce((sum, item) => sum + item.totalAmount, 0)
      const taxAmount = Math.floor(totalAmount * 0.1)
      const grandTotal = totalAmount + taxAmount
      return {totalAmount, taxAmount, grandTotal}
    }

    const {totalAmount, taxAmount, grandTotal} = recalculateTotals(summaryByCategory)

    // 単価のバリエーションを表示する関数
    const renderPriceVariations = (
      variations: PriceVariation[] | undefined,
      singlePrice: number | undefined
    ): React.ReactNode => {
      if (variations && variations.length > 1) {
        // 複数のバリエーションがある場合
        return (
          <div className="text-right">
            {variations.map((variation, idx) => {
              const startDateStr = formatDate(variation.startDate, 'MM/DD')
              const endDateStr = variation.endDate ? formatDate(variation.endDate, 'MM/DD') : null
              return (
                <div key={idx} className="text-xs">
                  {startDateStr}〜{endDateStr ? `${endDateStr}：` : '：'} {variation.price.toLocaleString()}円
                </div>
              )
            })}
          </div>
        )
      } else if (singlePrice !== undefined && singlePrice !== null) {
        // 単一の単価の場合
        return <div className="text-right">{singlePrice.toLocaleString()}円</div>
      } else {
        return <div className="text-right">0円</div>
      }
    }

    // 数値入力用のヘルパー関数
    const formatNumberForInput = (value: number | undefined | null): string => {
      if (value === undefined || value === null || isNaN(value)) return '0'
      return value.toLocaleString()
    }

    const parseNumberFromInput = (value: string): number => {
      // カンマを除去して数値に変換
      const cleaned = value.replace(/,/g, '')
      const num = Number(cleaned)
      return isNaN(num) ? 0 : num
    }

    // サマリーの編集
    const handleSummaryEdit = (index: number, field: 'category' | 'totalAmount', value: string | number) => {
      const updated = [...summaryByCategory]
      updated[index] = {
        ...updated[index],
        [field]: field === 'totalAmount' ? Number(value) : value,
      }
      setSummaryByCategory(updated)
    }

    // 明細の編集
    const handleDetailEdit = (index: number, field: keyof CategoryDetail, value: string | number) => {
      const updated = [...detailsByCategory]
      const numericFields: (keyof CategoryDetail)[] = [
        'trips',
        'unitPrice',
        'amount',
        'futaiFee',
        'tollFee',
        'specialAddition',
        'driverFeeUnitPrice',
        'futaiFeeUnitPrice',
        'tollFeeUnitPrice',
      ]
      // 文字列の場合は数値に変換（カンマを除去）
      const numValue = typeof value === 'string' ? parseNumberFromInput(value) : value
      updated[index] = {
        ...updated[index],
        [field]: numericFields.includes(field) ? numValue : value,
        isManualEdit: true,
      }
      // 金額を再計算
      if (field === 'trips' || field === 'unitPrice' || field === 'driverFeeUnitPrice') {
        const unitPrice = updated[index].driverFeeUnitPrice || updated[index].unitPrice || 0
        updated[index].amount = updated[index].trips * unitPrice
      }
      setDetailsByCategory(updated)
      // サマリーも更新
      updateSummaryFromDetails(updated)
    }

    // 明細からサマリーを更新
    const updateSummaryFromDetails = (details: CategoryDetail[]) => {
      const summaryMap = new Map<string, CategorySummary>()
      details.forEach(detail => {
        const existing = summaryMap.get(detail.categoryCode) || {
          category: detail.category,
          categoryCode: detail.categoryCode,
          totalTrips: 0,
          totalAmount: 0,
        }
        summaryMap.set(detail.categoryCode, {
          ...existing,
          totalTrips: existing.totalTrips + detail.trips,
          totalAmount:
            existing.totalAmount + detail.amount + (detail.futaiFee || 0) + detail.tollFee + (detail.specialAddition || 0),
        })
      })
      setSummaryByCategory(Array.from(summaryMap.values()))
    }

    // 明細行の追加
    const handleAddDetail = (categoryCode: string) => {
      const category = summaryByCategory.find(s => s.categoryCode === categoryCode)?.category || 'その他'
      const newDetail: CategoryDetail = {
        category,
        categoryCode,
        routeName: '',
        name: '',
        vehicleType: '',
        routeDirection: '',
        trips: 0,
        unitPrice: 0,
        amount: 0,
        futaiFee: 0,
        tollFee: 0,
        isManualAdded: true,
        isManualEdit: true,
      }
      setDetailsByCategory([...detailsByCategory, newDetail])
    }

    // 明細行の削除
    const handleDeleteDetail = (index: number) => {
      const detail = detailsByCategory[index]
      // 新規作成された行のみ削除可能
      if (!detail.isManualAdded) {
        if (!confirm('この行を削除しますか？')) {
          return
        }
      }
      const updated = detailsByCategory.filter((_, i) => i !== index)
      setDetailsByCategory(updated)
      updateSummaryFromDetails(updated)
    }

    // 明細行をアプリ連動データにリセット
    const handleResetDetail = async (index: number) => {
      const detail = detailsByCategory[index]
      // 新規作成された行の場合はリセットしない（削除のみ）
      if (detail.isManualAdded) {
        return
      }

      if (onResetDetail) {
        try {
          const resetDetail = await onResetDetail(detail)
          if (resetDetail) {
            const updated = [...detailsByCategory]
            updated[index] = {...resetDetail, isManualEdit: false}
            setDetailsByCategory(updated)
            updateSummaryFromDetails(updated)
          }
        } catch (error) {
          console.error('リセットエラー:', error)
          alert('リセットに失敗しました')
        }
      } else {
        // フォールバック: 初期データから同じ路線名・便名の行を探す
        const initialDetail = initialDetailsByCategory.find(
          initial =>
            initial.routeName === detail.routeName && initial.name === detail.name && initial.categoryCode === detail.categoryCode
        )

        if (initialDetail) {
          const updated = [...detailsByCategory]
          updated[index] = {...initialDetail, isManualEdit: false}
          setDetailsByCategory(updated)
          updateSummaryFromDetails(updated)
        }
      }
    }

    // 保存
    const handleSave = () => {
      if (onSave) {
        onSave(summaryByCategory, detailsByCategory)
      }
    }

    // 詳細を便区分ごとにグループ化
    const detailsByCategoryGroup = detailsByCategory.reduce(
      (acc, detail) => {
        if (!acc[detail.categoryCode]) {
          acc[detail.categoryCode] = []
        }
        acc[detail.categoryCode].push(detail)
        return acc
      },
      {} as Record<string, CategoryDetail[]>
    )

    return (
      <div
        className={cn(
          //
          '[&_th]:border',
          ' [&_th]:!p-1 ',
          ' [&_th]:text-center',

          //
          '[&_td]:border',
          ' [&_td]:!p-1 '
        )}
      >
        <div className="bg-white text-black print-target">
          {/* 保存ボタン（印刷時は非表示） */}
          {onSave && (
            <div className="no-print mb-4 p-4 bg-gray-50 rounded-lg">
              <Button onClick={handleSave} className="bg-green-600 text-white hover:bg-green-700">
                編集内容を保存
              </Button>
            </div>
          )}

          {/* 1ページ目: 請求書サマリー */}
          <div className="w-[297mm] min-h-[210mm] mx-auto p-8 page-break-after-always">
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
                    <tr
                      key={index}
                      className={item.totalAmount !== initialSummaryByCategory[index]?.totalAmount ? 'bg-yellow-50' : ''}
                    >
                      <td className="border border-gray-400 p-2">
                        {onSave ? (
                          <input
                            type="text"
                            value={item.category}
                            onChange={e => handleSummaryEdit(index, 'category', e.target.value)}
                            className="w-full bg-transparent border-none p-0"
                          />
                        ) : (
                          item.category
                        )}
                      </td>
                      <td className="border border-gray-400 p-2 text-right">
                        {onSave ? (
                          <input
                            type="text"
                            value={formatNumberForInput(item.totalAmount)}
                            onChange={e => handleSummaryEdit(index, 'totalAmount', parseNumberFromInput(e.target.value))}
                            className="w-full bg-transparent border-none p-0 text-right"
                          />
                        ) : (
                          item.totalAmount.toLocaleString()
                        )}
                      </td>
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
          {Object.entries(detailsByCategoryGroup).map(([categoryCode, details], pageIndex) => (
            <div
              key={categoryCode}
              className={`w-[297mm] min-h-[210mm] mx-auto p-8 border-y ${
                pageIndex < Object.keys(detailsByCategoryGroup).length - 1 ? 'page-break-after-always' : ''
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
                    <th className="border border-gray-400 p-2">車種</th>
                    <th className="border border-gray-400 p-2">便数</th>

                    {showUnitPrice && <th className="border border-gray-400 p-2">運賃単価</th>}
                    <th className="border border-gray-400 p-2">運賃合計</th>

                    {showUnitPrice && <th className="border border-gray-400 p-2">付帯料金単価</th>}
                    <th className="border border-gray-400 p-2">付帯料金合計</th>

                    {showUnitPrice && <th className="border border-gray-400 p-2">通行料単価</th>}
                    <th className="border border-gray-400 p-2">通行料合計</th>
                    <th className="border border-gray-400 p-2">合計</th>
                    {onSave && <th className="border border-gray-400 p-2">操作</th>}
                  </tr>
                </thead>
                <tbody>
                  {details.map((detail, detailIndex) => {
                    // グローバルインデックスを計算
                    let globalIndex = -1
                    let foundCount = 0
                    for (let i = 0; i < detailsByCategory.length; i++) {
                      if (detailsByCategory[i].categoryCode === categoryCode) {
                        if (foundCount === detailIndex) {
                          globalIndex = i
                          break
                        }
                        foundCount++
                      }
                    }
                    const isManual = detail.isManualEdit || detail.isManualAdded
                    return (
                      <tr key={`${categoryCode}-${detailIndex}`} className={isManual ? 'bg-yellow-50' : ''}>
                        <td className="border border-gray-400 p-2">
                          {onSave ? (
                            <input
                              type="text"
                              value={detail.routeName}
                              onChange={e => handleDetailEdit(globalIndex, 'routeName', e.target.value)}
                              className="w-full bg-transparent border-none p-0"
                            />
                          ) : (
                            detail.routeName
                          )}
                        </td>
                        <td className="border border-gray-400 p-2">
                          {onSave ? (
                            <input
                              type="text"
                              value={detail.name}
                              onChange={e => handleDetailEdit(globalIndex, 'name', e.target.value)}
                              className="w-full bg-transparent border-none p-0"
                            />
                          ) : (
                            detail.name
                          )}
                        </td>
                        <td className="border border-gray-400 p-2 text-center">
                          {onSave ? (
                            <input
                              type="text"
                              value={detail.vehicleType || ''}
                              onChange={e => handleDetailEdit(globalIndex, 'vehicleType', e.target.value)}
                              className="w-full bg-transparent border-none p-0 text-center"
                            />
                          ) : (
                            detail.vehicleType || ''
                          )}
                        </td>

                        <td className="border border-gray-400 p-2 text-center">
                          {onSave ? (
                            <input
                              type="number"
                              value={detail.trips}
                              onChange={e => handleDetailEdit(globalIndex, 'trips', e.target.value)}
                              className="w-full bg-transparent border-none p-0 text-center"
                            />
                          ) : (
                            detail.trips
                          )}
                        </td>

                        {/* 運賃単価 */}
                        {showUnitPrice && (
                          <td className="border border-gray-400 p-2 text-right">
                            {onSave ? (
                              <input
                                type="text"
                                value={formatNumberForInput(detail.driverFeeUnitPrice || detail.unitPrice)}
                                onChange={e => handleDetailEdit(globalIndex, 'driverFeeUnitPrice', e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-right"
                              />
                            ) : (
                              renderPriceVariations(detail.driverFeeVariations, detail.driverFeeUnitPrice || detail.unitPrice)
                            )}
                          </td>
                        )}
                        {/* 運賃合計 */}
                        <td className="border border-gray-400 p-2 text-right">
                          {onSave ? (
                            <input
                              type="text"
                              value={formatNumberForInput(detail.amount)}
                              onChange={e => handleDetailEdit(globalIndex, 'amount', e.target.value)}
                              className="w-full bg-transparent border-none p-0 text-right"
                            />
                          ) : (
                            `¥${detail.amount.toLocaleString()}`
                          )}
                        </td>
                        {/* 付帯料金単価 */}
                        {showUnitPrice && (
                          <td className="border border-gray-400 p-2 text-right">
                            {onSave ? (
                              <input
                                type="text"
                                value={formatNumberForInput(detail.futaiFeeUnitPrice)}
                                onChange={e => handleDetailEdit(globalIndex, 'futaiFeeUnitPrice', e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-right"
                              />
                            ) : (
                              renderPriceVariations(detail.futaiFeeVariations, detail.futaiFeeUnitPrice)
                            )}
                          </td>
                        )}
                        {/* 付帯料金合計 */}
                        <td className="border border-gray-400 p-2 text-right">
                          {onSave ? (
                            <input
                              type="text"
                              value={formatNumberForInput(detail.futaiFee)}
                              onChange={e => handleDetailEdit(globalIndex, 'futaiFee', e.target.value)}
                              className="w-full bg-transparent border-none p-0 text-right"
                            />
                          ) : (
                            `¥${(detail.futaiFee || 0).toLocaleString()}`
                          )}
                        </td>
                        {/* 通行料単価 */}
                        {showUnitPrice && (
                          <td className="border border-gray-400 p-2 text-right">
                            {onSave ? (
                              <input
                                type="text"
                                value={formatNumberForInput(detail.tollFeeUnitPrice)}
                                onChange={e => handleDetailEdit(globalIndex, 'tollFeeUnitPrice', e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-right"
                              />
                            ) : (
                              renderPriceVariations(detail.tollFeeVariations, detail.tollFeeUnitPrice)
                            )}
                          </td>
                        )}
                        {/* 通行料合計 */}
                        <td className="border border-gray-400 p-2 text-right">
                          {onSave ? (
                            <input
                              type="text"
                              value={formatNumberForInput(detail.tollFee)}
                              onChange={e => handleDetailEdit(globalIndex, 'tollFee', e.target.value)}
                              className="w-full bg-transparent border-none p-0 text-right"
                            />
                          ) : (
                            `¥${detail.tollFee.toLocaleString()}`
                          )}
                        </td>
                        <td className="border border-gray-400 p-2 text-right">
                          ¥
                          {(
                            detail.amount +
                            (detail.futaiFee || 0) +
                            detail.tollFee +
                            (detail.specialAddition || 0)
                          ).toLocaleString()}
                        </td>
                        {onSave && (
                          <td className="border border-gray-400 p-2">
                            <div className="flex items-center justify-center gap-2">
                              {/* 削除ボタン */}
                              <button
                                onClick={() => handleDeleteDetail(globalIndex)}
                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                                title="削除"
                              >
                                <Trash2 size={16} />
                              </button>
                              {/* リセットボタン（新規作成された行の場合は表示しない） */}
                              {!detail.isManualAdded && (
                                <button
                                  onClick={() => handleResetDetail(globalIndex)}
                                  className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                                  title="アプリ連動データに戻す"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                  {onSave && (
                    <tr>
                      <td colSpan={12} className="border border-gray-400 p-2">
                        <button
                          onClick={() => handleAddDetail(categoryCode)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          + 行を追加
                        </button>
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-400 p-2" colSpan={3}>
                      小計
                    </td>
                    <td className="border border-gray-400 p-2 text-center">
                      {details.reduce((sum, detail) => sum + detail.trips, 0)}
                    </td>

                    <td className="border border-gray-400 p-2 text-right"></td>
                    {showUnitPrice && (
                      <td className="border border-gray-400 p-2 text-right">
                        ¥{details.reduce((sum, detail) => sum + detail.amount, 0).toLocaleString()}
                      </td>
                    )}

                    <td className="border border-gray-400 p-2 text-right"></td>
                    {showUnitPrice && (
                      <td className="border border-gray-400 p-2 text-right">
                        ¥{details.reduce((sum, detail) => sum + (detail.futaiFee || 0), 0).toLocaleString()}
                      </td>
                    )}

                    <td className="border border-gray-400 p-2 text-right"></td>
                    {showUnitPrice && (
                      <td className="border border-gray-400 p-2 text-right">
                        ¥{details.reduce((sum, detail) => sum + detail.tollFee, 0).toLocaleString()}
                      </td>
                    )}
                    <td className="border border-gray-400 p-2 text-right">
                      ¥
                      {details
                        .reduce(
                          (sum, detail) =>
                            sum + detail.amount + (detail.futaiFee || 0) + detail.tollFee + (detail.specialAddition || 0),
                          0
                        )
                        .toLocaleString()}
                    </td>
                    {onSave && <td className="border border-gray-400 p-2"></td>}
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
              .no-print {
                display: none !important;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          `}</style>
        </div>
      </div>
    )
  }
)

InvoiceDocument.displayName = 'InvoiceDocument'
