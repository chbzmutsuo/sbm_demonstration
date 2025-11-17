'use client'

import React, {useState, useEffect} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {updateAlgorithm} from '@app/(excluded)/stock/api/jquants-server-actions/jquants-getter'
import {StockCl} from 'src/non-common/EsCollection/(stock)/StockCl'
import {getStockConfig} from 'src/non-common/EsCollection/(stock)/getStockConfig'

export default function StockTradingHabitsPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [completedTasks, setCompletedTasks] = useState<{[key: string]: boolean}>({})
  const [stockStats, setStockStats] = useState<{
    totalStocks: number
    favoriteStocks: number
    holdingStocks: number
    signalStocks: number
  }>({
    totalStocks: 0,
    favoriteStocks: 0,
    holdingStocks: 0,
    signalStocks: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // 統計データを取得
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [totalResult, favoriteResult, holdingResult, signalResult] = await Promise.all([
          doStandardPrisma('stock', 'findMany', {}),
          doStandardPrisma('stock', 'findMany', {where: {favorite: {gt: 0}}}),
          doStandardPrisma('stock', 'findMany', {where: {heldCount: {gt: 0}}}),
          // 全銘柄を取得してStockClクラスでシグナル判定
          doStandardPrisma('stock', 'findMany', {
            include: {
              StockHistory: {
                orderBy: {Date: 'desc'},
                take: 50, // 計算に必要な履歴データ
              },
            },
            take: 1000, // 処理対象銘柄数を制限
          }),
        ])

        // シグナル発生銘柄数をStockClクラスで計算
        let signalCount = 0
        if (signalResult.success && signalResult.result) {
          const stockConfig = await getStockConfig()
          const stocks = signalResult.result as any[]

          signalCount = stocks.filter(stock => {
            if (!stock.StockHistory || stock.StockHistory.length === 0) return false

            try {
              const stockInstance = new StockCl(stock, stockConfig)
              const barometer = stockInstance.barometer

              // いずれかのシグナルが発生していればカウント
              return Object.values(barometer).some(signal => signal === true)
            } catch (error) {
              return false
            }
          }).length
        }

        setStockStats({
          totalStocks: totalResult.success ? (totalResult.result as any[]).length : 0,
          favoriteStocks: favoriteResult.success ? (favoriteResult.result as any[]).length : 0,
          holdingStocks: holdingResult.success ? (holdingResult.result as any[]).length : 0,
          signalStocks: signalCount,
        })
      } catch (error) {
        console.error('統計データ取得エラー:', error)
      }
    }
    fetchStats()
  }, [])

  const updateSignals = async () => {
    setLoading(true)
    try {
      await updateAlgorithm({date: new Date()})
      // 統計データを再取得
      // 全銘柄を取得してStockClクラスでシグナル判定
      const signalResult = await doStandardPrisma('stock', 'findMany', {
        include: {
          StockHistory: {
            orderBy: {Date: 'desc'},
            take: 50,
          },
        },
        take: 1000,
      })

      let signalCount = 0
      if (signalResult.success && signalResult.result) {
        const stockConfig = await getStockConfig()
        const stocks = signalResult.result as any[]

        signalCount = stocks.filter(stock => {
          if (!stock.StockHistory || stock.StockHistory.length === 0) return false

          try {
            const stockInstance = new StockCl(stock, stockConfig)
            const barometer = stockInstance.barometer

            return Object.values(barometer).some(signal => signal === true)
          } catch (error) {
            return false
          }
        }).length
      }

      setStockStats(prev => ({
        ...prev,
        signalStocks: signalCount,
      }))
    } catch (error) {
      console.error('シグナル更新エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({...prev, [taskId]: !prev[taskId]}))
  }

  const currentHour = currentTime.getHours()
  const isMarketOpen = currentHour >= 9 && currentHour < 15
  const isPreMarket = currentHour >= 7 && currentHour < 9 // 7:00-9:00 寄付き前
  const isPostMarket = currentHour >= 15 && currentHour < 21 // 15:00-21:00 引け後
  const isWeekend = [0, 6].includes(currentTime.getDay())

  const morningTasks = [
    {id: 'api-data', label: 'APIデータ取得・シグナル自動判定', time: '6:00〜6:30'},
    {id: 'candidate-check', label: '候補銘柄チェック', time: '6:30〜7:00'},
    {id: 'journal-update', label: 'トレード日誌の更新', time: '7:00〜7:30'},
    {id: 'order-strategy', label: '注文戦略設計（寄成 or 指値）', time: '7:30〜8:00'},
    {id: 'market-check', label: '地合い確認（日経平均・先物・セクター）', time: '8:00〜8:30'},
  ]

  const eveningTasks = [
    {id: 'trade-result', label: '取引履歴と結果確認', time: '15:30〜16:00'},
    {id: 'chart-analysis', label: 'チャート検証', time: '16:00〜17:00'},
    {id: 'journal-entry', label: '日誌記入（自動補完＋主観補足）', time: '17:00〜18:00'},
  ]

  const weeklyTasks = [
    {id: 'profit-summary', label: '勝率・損益の集計'},
    {id: 'loss-analysis', label: '負けパターン分析'},
    {id: 'next-week-prep', label: '来週の注目銘柄準備'},
  ]

  const TaskCheckbox = ({task, onToggle}: {task: any; onToggle: (id: string) => void}) => (
    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:bg-gray-50">
      <input
        type="checkbox"
        checked={completedTasks[task.id] || false}
        onChange={() => onToggle(task.id)}
        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      />
      <div className="flex-1">
        <div className={`font-medium ${completedTasks[task.id] ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {task.label}
        </div>
        {task.time && <div className="text-sm text-gray-500">{task.time}</div>}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">株式スイングトレード習慣化</h1>
              <p className="text-gray-600 mt-2">戦略に基づいた判断とトレードの習慣化</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{formatDate(currentTime, 'YYYY/MM/DD')}</div>
              <div className="text-lg text-gray-600">{formatDate(currentTime, 'HH:mm')}</div>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">{stockStats.totalStocks.toLocaleString()}</div>
            <div className="text-sm text-gray-600">総銘柄数</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-yellow-600">{stockStats.favoriteStocks.toLocaleString()}</div>
            <div className="text-sm text-gray-600">お気に入り</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">{stockStats.holdingStocks.toLocaleString()}</div>
            <div className="text-sm text-gray-600">保有銘柄</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 relative">
            <div className="text-2xl font-bold text-red-600">{stockStats.signalStocks.toLocaleString()}</div>
            <div className="text-sm text-gray-600">シグナル発生</div>
            <Button
              className="absolute top-2 right-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1"
              onClick={updateSignals}
              disabled={loading}
            >
              {loading ? '更新中...' : '更新'}
            </Button>
          </div>
        </div>

        {/* 現在の推奨アクション */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 mb-6 text-white">
          <h2 className="text-xl font-bold mb-2">🎯 現在の推奨アクション</h2>
          {isPreMarket && <p className="text-lg">寄付き前ルーチンの時間です。シグナル判定から始めましょう。</p>}
          {isPostMarket && <p className="text-lg">トレード後ルーチンの時間です。今日の結果を確認しましょう。</p>}
          {isWeekend && <p className="text-lg">週次ルーチンの時間です。今週の成果を分析しましょう。</p>}
          {!isPreMarket && !isPostMarket && !isWeekend && (
            <p className="text-lg">市場時間中です。戦略に従って冷静にトレードしましょう。</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 毎朝ルーチン */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-bold text-gray-900">🌅 毎朝ルーチン（寄付き前）</h3>
            </div>
            <C_Stack className="space-y-3">
              {morningTasks.map(task => (
                <TaskCheckbox key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </C_Stack>
            <div className="mt-4 pt-4 border-t">
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => (window.location.href = '/stock/morning-routine')}
              >
                朝のルーチンを開始
              </Button>
            </div>
          </div>

          {/* トレード後ルーチン */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-bold text-gray-900">🌇 トレード後ルーチン</h3>
            </div>
            <C_Stack className="space-y-3">
              {eveningTasks.map(task => (
                <TaskCheckbox key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </C_Stack>
            <div className="mt-4 pt-4 border-t">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => (window.location.href = '/stock/evening-routine')}
              >
                夕方のルーチンを開始
              </Button>
            </div>
          </div>

          {/* 週次ルーチン */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-bold text-gray-900">📆 週次ルーチン</h3>
            </div>
            <C_Stack className="space-y-3">
              {weeklyTasks.map(task => (
                <TaskCheckbox key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </C_Stack>
            <div className="mt-4 pt-4 border-t">
              <Button
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => (window.location.href = '/stock/weekly-routine')}
              >
                週次分析を開始
              </Button>
            </div>
          </div>
        </div>

        {/* クイックアクセス */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 クイックアクセス</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => (window.location.href = '/stock/signal-screening')}
            >
              シグナルスクリーニング
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => (window.location.href = '/stock/watchlist')}
            >
              ウォッチリスト
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => (window.location.href = '/stock/trade-journal')}
            >
              トレード日誌
            </Button>
            <Button
              className="bg-gray-500 hover:bg-gray-600 text-white"
              onClick={() => (window.location.href = '/stock/settings')}
            >
              設定
            </Button>
          </div>
        </div>

        {/* 習慣化のポイント */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🧠 習慣化のポイント</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-800 mb-2">固定化</div>
              <p>毎朝・毎週のルーチンを固定化し、判断タイミングを限定</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-800 mb-2">可視化</div>
              <p>すべてをチェックリストUI化することで進捗を可視化</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-800 mb-2">感情排除</div>
              <p>重要な判断は「寄付き前 or 引け後」に限定して感情を排除</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
