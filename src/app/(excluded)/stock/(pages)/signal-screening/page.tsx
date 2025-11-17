'use client'

import React, {useState, useEffect} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {updateAlgorithm} from '@app/(excluded)/stock/api/jquants-server-actions/jquants-getter'
import {StockCl} from 'src/non-common/EsCollection/(stock)/StockCl'
import {getStockConfig} from 'src/non-common/EsCollection/(stock)/getStockConfig'

import {QueryBuilder} from '@app/(excluded)/stock/(builders)/QueryBuilder'
import {Stock} from '@prisma/client'
import {StockCard} from '@app/(excluded)/stock/(pages)/signal-screening/StockCard'

export default function SignalScreeningPage() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSignals, setSelectedSignals] = useState<string[]>(['josho', 'dekidakaJosho'])
  const [sortBy, setSortBy] = useState<'riseRate' | 'profit' | 'signalCount'>('riseRate')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const [config, setConfig] = useState<any>(null)
  const [barometerOptions, setBarometerOptions] = useState<any[]>([])

  const initializeConfig = async () => {
    try {
      const stockConfig = await getStockConfig()
      setConfig(stockConfig)

      const barometerObj = StockCl.getBarometerObject(stockConfig)
      const options = Object.values(barometerObj).map(d => ({
        key: d.id,
        label: d.label,
        description: d.description,
      }))
      setBarometerOptions(options)
    } catch (error) {
      console.error('設定取得エラー:', error)
    }
  }

  // StockClクラスから動的にシグナルオプションを取得
  const signalOptions = barometerOptions.length > 0 ? barometerOptions : []

  const fetchStocks = async () => {
    setLoading(true)
    try {
      const result = await doStandardPrisma('stock', 'findMany', {
        where: {
          CompanyName: {not: null},
          last_Close: {not: null},
        },
        include: QueryBuilder.getInclude({}).stock.include,

        orderBy: {last_riseRate: 'desc'},
        take: 500,
      })

      if (result.success && result.result) {
        setStocks(result.result as Stock[])
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSignals = async () => {
    setLoading(true)
    try {
      await updateAlgorithm({date: new Date()})
      await fetchStocks()
    } catch (error) {
      console.error('シグナル更新エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // 設定とバロメータオプションを初期化
  useEffect(() => {
    initializeConfig()
    fetchStocks()
  }, [])

  const toggleSignal = (signalKey: string) => {
    setSelectedSignals(prev => (prev.includes(signalKey) ? prev.filter(s => s !== signalKey) : [...prev, signalKey]))
  }

  const filteredStocks = stocks.filter(stock => {
    if (selectedSignals.length === 0) return true
    return selectedSignals.some(signal => stock[`last_${signal}` as keyof Stock])
  })

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    switch (sortBy) {
      case 'riseRate':
        return (b.last_riseRate || 0) - (a.last_riseRate || 0)
      case 'profit':
        return (b.profit || 0) - (a.profit || 0)
      case 'signalCount': {
        const aCount = selectedSignals.filter(s => a[`last_${s}` as keyof Stock]).length
        const bCount = selectedSignals.filter(s => b[`last_${s}` as keyof Stock]).length
        return bCount - aCount
      }
      default:
        return 0
    }
  })

  const getSignalCount = (stock: Stock) => {
    return signalOptions.filter(option => stock[`last_${option.key}` as keyof Stock]).length
  }

  const getActiveSignals = (stock: Stock) => {
    return signalOptions.filter(option => stock[`last_${option.key}` as keyof Stock]).map(option => option.label)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 シグナルスクリーニング</h1>
              <p className="text-gray-600 mt-2">テクニカル指標に基づく銘柄抽出</p>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && <div className="text-sm text-gray-500">最終更新: {formatDate(lastUpdated, 'MM/DD HH:mm')}</div>}
              <Button onClick={updateSignals} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
                {loading ? '更新中...' : 'シグナル更新'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* フィルター設定 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 シグナル選択</h3>
              <C_Stack className="space-y-3">
                {signalOptions.map(option => (
                  <div key={option.key} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedSignals.includes(option.key)}
                      onChange={() => toggleSignal(option.key)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </div>
                ))}
              </C_Stack>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📈 ソート設定</h3>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="riseRate">上昇率順</option>
                <option value="profit">利益順</option>
                <option value="signalCount">シグナル数順</option>
              </select>
            </div>
          </div>

          {/* 結果表示 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">🎯 抽出結果 ({sortedStocks.length}銘柄)</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">選択シグナル: {selectedSignals.length}個</div>
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
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">データを読み込み中...</p>
                </div>
              ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sortedStocks.slice(0, 20).map(stock => (
                    <StockCard key={stock.id} stock={stock} config={config} signalOptions={signalOptions} />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-semibold">銘柄</th>
                        <th className="text-right p-3 font-semibold">現在値</th>
                        <th className="text-right p-3 font-semibold">上昇率</th>
                        <th className="text-right p-3 font-semibold">利益</th>
                        <th className="text-center p-3 font-semibold">シグナル数</th>
                        <th className="text-left p-3 font-semibold">発生シグナル</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedStocks.slice(0, 50).map(stock => (
                        <tr key={stock.id} className="border-b hover:bg-gray-50">
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
                            {stock.last_riseRate && stock.last_riseRate > 0 ? '+' : ''}
                            {stock.last_riseRate?.toFixed(2)}%
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
                          <td className="text-center p-3">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                              {getSignalCount(stock)}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {getActiveSignals(stock)
                                .slice(0, 3)
                                .map(signal => (
                                  <span key={signal} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    {signal}
                                  </span>
                                ))}
                              {getActiveSignals(stock).length > 3 && (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                  +{getActiveSignals(stock).length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
