'use client'

import React, {useState, useEffect} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {StockCl} from 'src/non-common/EsCollection/(stock)/StockCl'
import {getStockConfig} from 'src/non-common/EsCollection/(stock)/getStockConfig'
import StockChart from '@app/(excluded)/stock/(components)/StockChart'

interface WatchlistStock {
  id: number
  Code: string
  CompanyName: string
  last_Close: number
  last_riseRate: number
  favorite: number
  profit: number
  heldCount: number
  averageBuyPrice: number
  last_josho: boolean
  last_dekidakaJosho: boolean
  last_renzokuJosho: boolean
  last_takaneBreakout: boolean
  last_goldenCross: boolean
  last_rsiOversold: boolean
  last_crashAndRebound: boolean
  last_consecutivePositiveCloses: boolean
  last_macdBullish: boolean
  last_spikeRise: boolean
}

// WatchlistStockCardコンポーネント
function WatchlistStockCard({
  stock,
  config,
  updateFavorite,
  updateHolding,
}: {
  stock: WatchlistStock
  config: any
  updateFavorite: (id: number, value: number) => void
  updateHolding: (id: number, heldCount: number, averageBuyPrice: number) => void
}) {
  if (!config) return null

  const stockInstance = new StockCl(stock as any, config)

  // StockClクラスから動的にアクティブシグナルを取得
  const getActiveSignals = (stock: WatchlistStock) => {
    const barometerObj = StockCl.getBarometerObject(config)
    const barometer = stockInstance.barometer

    return Object.values(barometerObj)
      .filter(signal => barometer[signal.id])
      .map(signal => signal.label)
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-lg">{stock.Code}</div>
          <div className="text-sm text-gray-600 truncate">{stock.CompanyName}</div>
          {/* お気に入り星 */}
          <div className="flex items-center space-x-1 mt-1">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => updateFavorite(stock.id, level === stock.favorite ? 0 : level)}
                className={`text-sm ${
                  level <= (stock.favorite || 0) ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg">{stock.last_Close?.toLocaleString()}円</div>
          <div className={`font-mono text-sm ${(stock.last_riseRate || 0) >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {stock.last_riseRate > 0 ? '+' : ''}
            {stock.last_riseRate?.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* チャート */}
      <div className="mb-3">
        <StockChart data={stockInstance.prevListAsc as any} macdData={stockInstance.getMacdValues()} height={80} />
      </div>

      {/* 保有情報 */}
      {stock.heldCount > 0 && (
        <div className="bg-blue-50 p-2 rounded mb-3 text-sm">
          <div>
            保有: {stock.heldCount}株 @ {stock.averageBuyPrice?.toLocaleString()}円
          </div>
          <div className={`font-semibold ${(stock.profit || 0) >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
            評価損益: {stock.profit > 0 ? '+' : ''}
            {stock.profit?.toLocaleString()}円
          </div>
        </div>
      )}

      {/* アクティブシグナル */}
      <div className="flex flex-wrap gap-1 mb-3">
        {getActiveSignals(stock)
          .slice(0, 2)
          .map(signal => (
            <span key={signal} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
              {signal}
            </span>
          ))}
        {getActiveSignals(stock).length > 2 && (
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">+{getActiveSignals(stock).length - 2}</span>
        )}
      </div>

      {/* 操作ボタン */}
      <Button
        className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 w-full"
        onClick={() => {
          const heldCount = prompt('保有数を入力してください:', String(stock.heldCount || 0))
          const averageBuyPrice = prompt('平均取得価格を入力してください:', String(stock.averageBuyPrice || 0))
          if (heldCount !== null && averageBuyPrice !== null) {
            updateHolding(stock.id, parseInt(heldCount) || 0, parseFloat(averageBuyPrice) || 0)
          }
        }}
      >
        保有情報編集
      </Button>
    </div>
  )
}

export default function WatchlistPage() {
  const [stocks, setStocks] = useState<WatchlistStock[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'favorites' | 'holdings'>('all')
  const [sortBy, setSortBy] = useState<'riseRate' | 'profit' | 'favorite'>('riseRate')
  const [config, setConfig] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')

  const fetchStocks = async () => {
    setLoading(true)
    try {
      const whereCondition = (() => {
        switch (filter) {
          case 'favorites':
            return {favorite: {gt: 0}, CompanyName: {not: null}}
          case 'holdings':
            return {heldCount: {gt: 0}, CompanyName: {not: null}}
          default:
            return {
              OR: [{favorite: {gt: 0}}, {heldCount: {gt: 0}}],
              CompanyName: {not: null},
            }
        }
      })()

      const result = await doStandardPrisma('stock', 'findMany', {
        where: whereCondition,
        orderBy: {[sortBy]: 'desc'},
        take: 200,
      })

      if (result.success && result.result) {
        setStocks(result.result as WatchlistStock[])
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFavorite = async (stockId: number, newFavoriteValue: number) => {
    try {
      await doStandardPrisma('stock', 'update', {
        where: {id: stockId},
        data: {favorite: newFavoriteValue},
      })
      await fetchStocks()
    } catch (error) {
      console.error('お気に入り更新エラー:', error)
    }
  }

  const updateHolding = async (stockId: number, heldCount: number, averageBuyPrice: number) => {
    try {
      await doStandardPrisma('stock', 'update', {
        where: {id: stockId},
        data: {heldCount, averageBuyPrice},
      })
      await fetchStocks()
    } catch (error) {
      console.error('保有情報更新エラー:', error)
    }
  }

  useEffect(() => {
    const initializeConfig = async () => {
      try {
        const stockConfig = await getStockConfig()
        setConfig(stockConfig)
      } catch (error) {
        console.error('設定取得エラー:', error)
      }
    }
    initializeConfig()
    fetchStocks()
  }, [filter, sortBy])

  // StockClクラスから動的にアクティブシグナルを取得（テーブル表示用）
  const getActiveSignals = (stock: WatchlistStock) => {
    if (!config) return []

    const stockInstance = new StockCl(stock as any, config)
    const barometerObj = StockCl.getBarometerObject(config)
    const barometer = stockInstance.barometer

    return Object.values(barometerObj)
      .filter(signal => barometer[signal.id])
      .map(signal => signal.label)
  }

  const sortedStocks = [...stocks].sort((a, b) => {
    switch (sortBy) {
      case 'riseRate':
        return (b.last_riseRate || 0) - (a.last_riseRate || 0)
      case 'profit':
        return (b.profit || 0) - (a.profit || 0)
      case 'favorite':
        return (b.favorite || 0) - (a.favorite || 0)
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👁️ ウォッチリスト</h1>
              <p className="text-gray-600 mt-2">お気に入り銘柄と保有銘柄の監視</p>
            </div>
            <Button onClick={fetchStocks} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
              {loading ? '更新中...' : '更新'}
            </Button>
          </div>
        </div>

        {/* フィルターとソート */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">表示:</label>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as any)}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="favorites">お気に入りのみ</option>
                <option value="holdings">保有銘柄のみ</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">ソート:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="riseRate">上昇率順</option>
                <option value="profit">利益順</option>
                <option value="favorite">お気に入り順</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">{sortedStocks.length}銘柄を表示中</div>
          </div>
        </div>

        {/* 銘柄リスト */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">📊 ウォッチリスト ({sortedStocks.length}銘柄)</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'cards' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                カード表示
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                テーブル表示
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">データを読み込み中...</p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedStocks.map(stock => (
                <WatchlistStockCard
                  key={stock.id}
                  stock={stock}
                  config={config}
                  updateFavorite={updateFavorite}
                  updateHolding={updateHolding}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold">お気に入り</th>
                    <th className="text-left p-3 font-semibold">銘柄</th>
                    <th className="text-right p-3 font-semibold">現在値</th>
                    <th className="text-right p-3 font-semibold">上昇率</th>
                    <th className="text-right p-3 font-semibold">保有数</th>
                    <th className="text-right p-3 font-semibold">平均取得価格</th>
                    <th className="text-right p-3 font-semibold">評価損益</th>
                    <th className="text-left p-3 font-semibold">シグナル</th>
                    <th className="text-center p-3 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStocks.map(stock => (
                    <tr key={stock.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map(level => (
                            <button
                              key={level}
                              onClick={() => updateFavorite(stock.id, level === stock.favorite ? 0 : level)}
                              className={`text-lg ${
                                level <= (stock.favorite || 0) ? 'text-yellow-400' : 'text-gray-300'
                              } hover:text-yellow-400`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{stock.Code}</div>
                        <div className="text-xs text-gray-500 truncate max-w-32">{stock.CompanyName}</div>
                      </td>
                      <td className="text-right p-3 font-mono">{stock.last_Close?.toLocaleString()}円</td>
                      <td
                        className={`text-right p-3 font-mono font-semibold ${
                          (stock.last_riseRate || 0) >= 0 ? 'text-red-600' : 'text-blue-600'
                        }`}
                      >
                        {stock.last_riseRate > 0 ? '+' : ''}
                        {stock.last_riseRate?.toFixed(2)}%
                      </td>
                      <td className="text-right p-3 font-mono">{stock.heldCount || 0}株</td>
                      <td className="text-right p-3 font-mono">
                        {stock.averageBuyPrice ? `${stock.averageBuyPrice.toLocaleString()}円` : '-'}
                      </td>
                      <td
                        className={`text-right p-3 font-mono font-semibold ${
                          (stock.profit || 0) >= 0 ? 'text-red-600' : 'text-blue-600'
                        }`}
                      >
                        {stock.profit ? (
                          <>
                            {stock.profit > 0 ? '+' : ''}
                            {stock.profit.toLocaleString()}円
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {getActiveSignals(stock)
                            .slice(0, 2)
                            .map(signal => (
                              <span key={signal} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {signal}
                              </span>
                            ))}
                          {getActiveSignals(stock).length > 2 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              +{getActiveSignals(stock).length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <Button
                          className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1"
                          onClick={() => {
                            const heldCount = prompt('保有数を入力してください:', String(stock.heldCount || 0))
                            const averageBuyPrice = prompt('平均取得価格を入力してください:', String(stock.averageBuyPrice || 0))
                            if (heldCount !== null && averageBuyPrice !== null) {
                              updateHolding(stock.id, parseInt(heldCount) || 0, parseFloat(averageBuyPrice) || 0)
                            }
                          }}
                        >
                          保有情報編集
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">📊 保有銘柄統計</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>保有銘柄数:</span>
                <span className="font-semibold">{stocks.filter(s => s.heldCount > 0).length}銘柄</span>
              </div>
              <div className="flex justify-between">
                <span>総評価損益:</span>
                <span
                  className={`font-semibold ${
                    stocks.reduce((sum, s) => sum + (s.profit || 0), 0) >= 0 ? 'text-red-600' : 'text-blue-600'
                  }`}
                >
                  {stocks.reduce((sum, s) => sum + (s.profit || 0), 0).toLocaleString()}円
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">⭐ お気に入り統計</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>お気に入り銘柄数:</span>
                <span className="font-semibold">{stocks.filter(s => s.favorite > 0).length}銘柄</span>
              </div>
              <div className="flex justify-between">
                <span>平均お気に入り度:</span>
                <span className="font-semibold">
                  {stocks.filter(s => s.favorite > 0).length > 0
                    ? (stocks.reduce((sum, s) => sum + (s.favorite || 0), 0) / stocks.filter(s => s.favorite > 0).length).toFixed(
                        1
                      )
                    : '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🚨 アラート</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>シグナル発生中:</span>
                <span className="font-semibold text-green-600">
                  {stocks.filter(s => getActiveSignals(s).length > 0).length}銘柄
                </span>
              </div>
              <div className="flex justify-between">
                <span>要注意銘柄:</span>
                <span className="font-semibold text-red-600">{stocks.filter(s => (s.last_riseRate || 0) < -5).length}銘柄</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
