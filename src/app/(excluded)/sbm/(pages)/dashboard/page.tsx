'use client'

import React, {useState, useEffect} from 'react'
import {BarChart2, Users, Calendar, TrendingUp} from 'lucide-react'
import {getDashboardStats} from '../../actions'

import {formatDate} from '@cm/class/Days/date-utils/formatters'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [stats, setStats] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [selectedDate])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await getDashboardStats(selectedDate)
      setStats(data)
    } catch (error) {
      console.error('統計データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">データの読み込みに失敗しました</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">ダッシュボード</h1>
        <div className="flex items-center space-x-4">
          <label htmlFor="date" className="text-sm font-medium text-gray-700">
            日付:
          </label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="売上合計"
          value={`¥${stats.totalSales.toLocaleString()}`}
          icon={<TrendingUp className="h-8 w-8 text-green-600" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="粗利合計"
          value={`¥${stats.profit.toLocaleString()}`}
          icon={<BarChart2 className="h-8 w-8 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="注文件数"
          value={`${stats.orderCount}件`}
          icon={<Calendar className="h-8 w-8 text-purple-600" />}
          bgColor="bg-purple-50"
        />
        <StatCard
          title="平均客単価"
          value={`¥${Math.round(stats.avgOrderValue).toLocaleString()}`}
          icon={<Users className="h-8 w-8 text-orange-600" />}
          bgColor="bg-orange-50"
        />
      </div>

      {/* 詳細統計 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用途別売上 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">用途別売上明細</h3>
          {stats.salesByPurpose.length > 0 ? (
            <div className="space-y-3">
              {stats.salesByPurpose.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.purpose}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">¥{item.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{item.count}件</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">データがありません</p>
          )}
        </div>

        {/* 商品別売上 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">商品別売上明細</h3>
          {stats.salesByProduct.length > 0 ? (
            <div className="space-y-3">
              {stats.salesByProduct.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.productName}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">¥{item.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{item.count}個</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">データがありません</p>
          )}
        </div>
      </div>
    </div>
  )
}

// 統計カードコンポーネント
const StatCard = ({title, value, icon, bgColor}: {title: string; value: string; icon: React.ReactNode; bgColor: string}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>{icon}</div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-lg font-semibold text-gray-900">{value}</dd>
        </dl>
      </div>
    </div>
  </div>
)
