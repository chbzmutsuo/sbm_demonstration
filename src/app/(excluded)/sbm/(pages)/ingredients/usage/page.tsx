'use client'

import React, {useState} from 'react'
import {Calculator} from 'lucide-react'
import {FilterSection} from '@cm/components/utils/FilterSection'
import {calculateIngredientsUsage} from '../../../actions/ingredientActions'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {toUtc} from '@cm/class/Days/date-utils/calculations'

export default function IngredientsUsagePage() {
  const [startDate, setStartDate] = useState(formatDate(new Date()))
  const [endDate, setEndDate] = useState(formatDate(new Date()))
  const [ingredientsUsage, setIngredientsUsage] = useState<IngredientUsageType[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleCalculate = async () => {
    setLoading(true)
    try {
      const deliveryDate = {
        gte: toUtc(startDate),
        lte: toUtc(endDate),
        isCanceled: false,
      }
      const data = await calculateIngredientsUsage({where: {deliveryDate}})
      setIngredientsUsage(data)
      setHasSearched(true)
    } catch (error) {
      console.error('材料使用量の計算に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (ingredientsUsage.length === 0) return

    const headers = ['材料名', '単位', '合計使用量']
    const rows = ingredientsUsage.map(item => [item.name, item.unit, item.totalQuantity.toString()])

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `材料使用量_${startDate}_${endDate}.csv`
    link.click()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 p-4 max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">材料使用量計算</h1>
      </div>

      {/* フィルター */}
      <FilterSection
        onApply={handleCalculate}
        onClear={() => {
          setStartDate(formatDate(new Date()))
          setEndDate(formatDate(new Date()))
        }}
        title="期間指定"
      >
        <div className="flex justify-center">
          <div className="flex space-x-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">開始日</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">終了日</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* 結果表示 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">材料使用量一覧 ({ingredientsUsage.length}件)</h2>

          {/* {ingredientsUsage.length > 0 && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download size={16} className="mr-1" /> CSV出力
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer size={16} className="mr-1" /> 印刷
              </Button>
            </div>
          )} */}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">材料名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">単位</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">合計使用量</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ingredientsUsage.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="font-semibold text-gray-900">{item.totalQuantity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">計算中...</p>
          </div>
        )}

        {!loading && hasSearched && ingredientsUsage.length === 0 && (
          <div className="text-center py-8">
            <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">指定期間内の材料使用量はありません</p>
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="text-center py-8">
            <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">期間を指定して「検索」ボタンをクリックしてください</p>
          </div>
        )}
      </div>

      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white,
          .bg-white * {
            visibility: visible;
          }
          .bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button,
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
