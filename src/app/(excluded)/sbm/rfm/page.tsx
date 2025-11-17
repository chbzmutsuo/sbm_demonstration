'use client'

import React, {useState, useEffect} from 'react'
import {BarChart3, TrendingUp, Users, Target, Calendar} from 'lucide-react'
import {getRFMAnalysis} from '../actions'

import {formatDate} from '@cm/class/Days/date-utils/formatters'

export default function RFMPage() {
  const [rfmData, setRfmData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSegment, setSelectedSegment] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30日前
    endDate: formatDate(new Date()),
  })

  useEffect(() => {
    loadRFMData()
  }, [dateRange])

  const loadRFMData = async () => {
    setLoading(true)
    try {
      const data = await getRFMAnalysis()
      setRfmData(data)
    } catch (error) {
      console.error('RFMデータの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target
    setDateRange(prev => ({...prev, [name]: value}))
  }

  const handleSegmentFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSegment(e.target.value)
  }

  const filteredRFMData = selectedSegment ? rfmData.filter(item => item.rank === selectedSegment) : rfmData

  // セグメント別統計
  const segmentStats = rfmData.reduce(
    (acc, item) => {
      const segment = item.rank || 'その他'
      if (!acc[segment]) {
        acc[segment] = {count: 0, totalValue: 0, avgRecency: 0, avgFrequency: 0}
      }
      acc[segment].count++
      acc[segment].totalValue += item.monetary || 0
      acc[segment].avgRecency += item.recency || 0
      acc[segment].avgFrequency += item.frequency || 0
      return acc
    },
    {} as Record<string, any>
  )

  Object.keys(segmentStats).forEach(segment => {
    const stats = segmentStats[segment]
    stats.avgRecency = Math.round(stats.avgRecency / stats.count)
    stats.avgFrequency = Math.round(stats.avgFrequency / stats.count)
    stats.avgValue = Math.round(stats.totalValue / stats.count)
  })

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'Champions':
        return 'bg-green-100 text-green-800'
      case 'Loyal Customers':
        return 'bg-blue-100 text-blue-800'
      case 'Potential Loyalists':
        return 'bg-yellow-100 text-yellow-800'
      case 'New Customers':
        return 'bg-purple-100 text-purple-800'
      case 'Promising':
        return 'bg-indigo-100 text-indigo-800'
      case 'Need Attention':
        return 'bg-orange-100 text-orange-800'
      case 'About to Sleep':
        return 'bg-red-100 text-red-800'
      case 'At Risk':
        return 'bg-red-200 text-red-900'
      case 'Cannot Lose Them':
        return 'bg-red-300 text-red-900'
      case 'Hibernating':
        return 'bg-gray-100 text-gray-800'
      case 'Lost':
        return 'bg-gray-200 text-gray-900'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getSegmentDescription = (segment: string) => {
    switch (segment) {
      case 'Champions':
        return '最高の顧客。積極的にアプローチし、関係を維持。'
      case 'Loyal Customers':
        return 'ロイヤル顧客。定期的な特典とコミュニケーションを。'
      case 'Potential Loyalists':
        return 'ロイヤル化の可能性。特別オファーで囲い込み。'
      case 'New Customers':
        return '新規顧客。オンボーディングと初回体験の向上を。'
      case 'Promising':
        return '有望な顧客。継続利用を促進するアプローチを。'
      case 'Need Attention':
        return '注意が必要。限定オファーで関心を取り戻す。'
      case 'About to Sleep':
        return '休眠前段階。パーソナライズされたオファーを。'
      case 'At Risk':
        return 'リスク顧客。積極的な再エンゲージメント施策を。'
      case 'Cannot Lose Them':
        return '失えない顧客。最優先で挽回施策を実施。'
      case 'Hibernating':
        return '休眠顧客。魅力的なオファーで再活性化を。'
      case 'Lost':
        return '失った顧客。コスト効率を考慮した復帰施策を。'
      default:
        return 'その他のセグメント'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">RFMデータを分析中...</p>
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
            <BarChart3 className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">RFM分析</h1>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分析開始日</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分析終了日</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">セグメントフィルター</label>
              <select
                value={selectedSegment}
                onChange={handleSegmentFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべてのセグメント</option>
                <option value="Champions">Champions</option>
                <option value="Loyal Customers">Loyal Customers</option>
                <option value="Potential Loyalists">Potential Loyalists</option>
                <option value="New Customers">New Customers</option>
                <option value="Promising">Promising</option>
                <option value="Need Attention">Need Attention</option>
                <option value="About to Sleep">About to Sleep</option>
                <option value="At Risk">At Risk</option>
                <option value="Cannot Lose Them">Cannot Lose Them</option>
                <option value="Hibernating">Hibernating</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>
        </div>

        {/* セグメント概要統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">総顧客数</p>
                <p className="text-2xl font-semibold text-gray-900">{rfmData.length}人</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Target className="text-green-600" size={24} />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Champions</p>
                <p className="text-2xl font-semibold text-gray-900">{segmentStats['Champions']?.count || 0}人</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <TrendingUp className="text-yellow-600" size={24} />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">平均購入額</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ¥
                  {Math.round(
                    rfmData.reduce((sum, item) => sum + (item.monetary || 0), 0) / rfmData.length || 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">アクティブセグメント</p>
                <p className="text-2xl font-semibold text-gray-900">{Object.keys(segmentStats).length}種類</p>
              </div>
            </div>
          </div>
        </div>

        {/* セグメント別サマリー */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">セグメント別サマリー</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {Object.entries(segmentStats).map((props: [string, any]) => {
              const [segment, stats] = props
              return (
                <div key={segment} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getSegmentColor(segment)}`}>{segment}</span>
                    <span className="text-lg font-bold text-gray-900">{stats.count}人</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>平均購入額:</span>
                      <span className="font-semibold">¥{stats.avgValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>新しさスコア:</span>
                      <span className="font-semibold">{stats.avgRecency}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>頻度スコア:</span>
                      <span className="font-semibold">{stats.avgFrequency}/5</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{getSegmentDescription(segment)}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 顧客詳細リスト */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">顧客別RFM詳細 ({filteredRFMData.length}件)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">セグメント</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monetary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終購入日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">総購入回数</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRFMData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.SbmCustomer?.companyName}</div>
                      <div className="text-sm text-gray-500">{item.SbmCustomer?.contactName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSegmentColor(item.rank!)}`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-semibold text-gray-900">{item.recency}/5</div>
                        <div className="ml-2 w-8 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: `${(item.recency! / 5) * 100}%`}}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-semibold text-gray-900">{item.frequency}/5</div>
                        <div className="ml-2 w-8 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: `${(item.frequency! / 5) * 100}%`}}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-semibold text-gray-900">{item.monetary}/5</div>
                        <div className="ml-2 w-8 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{width: `${(item.monetary! / 5) * 100}%`}}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.analysisDate ? formatDate(item.analysisDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalScore}回</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRFMData.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {selectedSegment ? '選択したセグメントにデータがありません' : 'RFMデータがありません'}
              </p>
            </div>
          )}
        </div>

        {/* RFM分析について */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 RFM分析について</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2 text-blue-800">Recency (新しさ)</h4>
              <p>最後の購入からの経過日数。スコアが高いほど最近購入している優良顧客。</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-green-800">Frequency (頻度)</h4>
              <p>指定期間内の購入回数。スコアが高いほど頻繁に利用する常連顧客。</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-yellow-800">Monetary (金額)</h4>
              <p>指定期間内の総購入金額。スコアが高いほど売上貢献度の高い顧客。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
