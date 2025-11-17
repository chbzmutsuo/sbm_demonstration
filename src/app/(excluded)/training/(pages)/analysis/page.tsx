'use client'

import React, {useState, useEffect, useMemo} from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {useExerciseMasters} from '../../hooks/useExerciseMasters'
import {
  getMonthlyAnalysisData,
  getMonthlyTrendsData,
  getAllExercisesProgressData,
  calculateMonthlyStats,
  type MonthlyStats,
} from '../../server-actions/analysis-data'
import {ExerciseMaster} from '../../types/training'
import {
  PartPieChart,
  MonthlyTrendBarChart,
  ExerciseProgressLineChart,
  StatsCard,
} from '../../(components)/Analysis/AnalysisCharts'
import {PART_OPTIONS} from '@app/(excluded)/training/(constants)/PART_OPTIONS'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export default function AnalysisPage() {
  const {session} = useGlobal()
  const userId = session?.id || 1
  const [subView, setSubView] = useState<'dashboard' | 'exercise'>('dashboard')
  const [analysisType, setAnalysisType] = useState<'volume' | 'reps'>('volume')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  // データ状態
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null)
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyStats[]>([])
  const [exerciseProgressData, setExerciseProgressData] = useState<any[]>([])

  const {masters, fetchMasters} = useExerciseMasters({userId})

  // 初回ロード時に種目マスタを取得
  useEffect(() => {
    fetchMasters()
  }, [])

  // 月間ダッシュボードデータを効率的に取得
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (subView !== 'dashboard' || masters.length === 0) return

      setIsLoading(true)
      try {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        // 現在月のデータを取得
        const currentMonthResult = await getMonthlyAnalysisData(userId, year, month)
        if (currentMonthResult.result) {
          const currentStats = await calculateMonthlyStats(currentMonthResult.result, year, month)
          setMonthlyStats(currentStats)
        }

        // 過去6ヶ月の推移データを取得
        const trendsResult = await getMonthlyTrendsData(
          userId,
          year,
          month - 5, // 6ヶ月前から
          6 // 6ヶ月分
        )

        if (trendsResult.result) {
          // 月別にグループ化して統計を計算
          const monthlyMap = new Map<string, any[]>()
          trendsResult.result.forEach(log => {
            const logDate = new Date(log.date)
            const key = `${logDate.getFullYear()}-${logDate.getMonth()}`
            if (!monthlyMap.has(key)) {
              monthlyMap.set(key, [])
            }
            monthlyMap.get(key)!.push(log)
          })

          const trends: MonthlyStats[] = []
          for (let i = 5; i >= 0; i--) {
            const date = new Date(currentMonth)
            date.setMonth(currentMonth.getMonth() - i)
            const key = `${date.getFullYear()}-${date.getMonth()}`
            const logList = monthlyMap.get(key) || []
            const stats = await calculateMonthlyStats(logList, date.getFullYear(), date.getMonth())
            trends.push(stats)
          }
          setMonthlyTrends(trends)
        }
      } catch (error) {
        console.error('ダッシュボードデータの取得に失敗しました:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [currentMonth, masters, userId, subView])

  // 種目別分析データを効率的に取得
  useEffect(() => {
    const fetchExerciseData = async () => {
      if (subView !== 'exercise' || masters.length === 0) return

      setIsLoading(true)
      try {
        const result = await getAllExercisesProgressData(userId, 6) // 6ヶ月分
        if (result.result) {
          setExerciseProgressData(result.result)
        }
      } catch (error) {
        console.error('種目データの取得に失敗しました:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExerciseData()
  }, [masters, userId, subView])

  // グラフ用データを計算
  const chartData = useMemo(() => {
    if (!monthlyStats) return null

    // 部位別円グラフ用データ（PART_OPTIONSのカラーを適用）
    const pieData = monthlyStats.partStats.map(part => {
      const partColor = PART_OPTIONS.find(p => p.label === part.part)?.color || '#636E72'
      return {
        name: part.part,
        value: analysisType === 'volume' ? part.totalVolume : part.totalReps,
        color: partColor,
      }
    })

    // 月間推移棒グラフ用データ
    const trendData = monthlyTrends.map(stats => ({
      name: stats.name,
      trainingDays: stats.trainingDays,
      totalSets: stats.totalSets,
      totalVolume: stats.totalVolume,
      totalReps: stats.totalReps,
    }))

    return {pieData, trendData}
  }, [monthlyStats, monthlyTrends, analysisType])

  // 種目別進捗データを計算
  const exerciseChartData = useMemo(() => {
    if (!exerciseProgressData.length) return {}

    const grouped = exerciseProgressData.reduce(
      (acc, log) => {
        const exerciseId = log.exerciseId
        if (!acc[exerciseId]) {
          acc[exerciseId] = {
            master: log.ExerciseMaster,
            logList: [],
          }
        }
        acc[exerciseId].logList.push(log)
        return acc
      },
      {} as Record<number, {master: ExerciseMaster; logList: any[]}>
    )

    // 各種目のチャートデータを生成
    Object.values(grouped).forEach((exerciseData: any) => {
      const {logList} = exerciseData

      // 日付ごとにデータを集約
      const dataByDate = logList.reduce(
        (acc: any, log: any) => {
          const dateStr = formatDate(new Date(log.date), 'YYYY-MM-DD')
          if (!acc[dateStr]) {
            acc[dateStr] = {
              date: dateStr,
              totalVolume: 0,
              maxStrength: 0,
              totalReps: 0,
              setCount: 0,
            }
          }
          acc[dateStr].totalVolume += log.strength * log.reps
          acc[dateStr].totalReps += log.reps
          acc[dateStr].setCount += 1
          if (log.strength > acc[dateStr].maxStrength) {
            acc[dateStr].maxStrength = log.strength
          }
          return acc
        },
        {} as Record<string, any>
      )

      exerciseData.chartData = Object.values(dataByDate).sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    })

    return grouped
  }, [exerciseProgressData])

  // 部位別にグループ化
  const groupedMasters = useMemo(() => {
    const grouped = masters.reduce(
      (acc, master) => {
        const part = master.part
        if (!acc[part]) acc[part] = []
        acc[part].push(master)
        return acc
      },
      {} as Record<string, ExerciseMaster[]>
    )

    const partOrder = PART_OPTIONS.map(part => part.label)
    const sortedParts = Object.keys(grouped).sort((a, b) => {
      const aIndex = partOrder.indexOf(a)
      const bIndex = partOrder.indexOf(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })

    return {grouped, sortedParts}
  }, [masters])

  // 月を変更
  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + offset)
    setCurrentMonth(newMonth)
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-4">
      {/* ヘッダー */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">トレーニング分析</h1>
        <p className="text-slate-600">効率的なデータ取得とRechartsによるグラフ表示</p>
      </div>
      {/* タブ切り替え */}
      <div className="flex bg-slate-200 rounded-lg p-1">
        <button
          onClick={() => setSubView('dashboard')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
            subView === 'dashboard' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'
          }`}
        >
          月間ダッシュボード
        </button>
        <button
          onClick={() => setSubView('exercise')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
            subView === 'exercise' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'
          }`}
        >
          種目別分析
        </button>
      </div>
      {/* 部位別カラーレジェンド（種目別分析時のみ表示） */}
      {subView === 'exercise' && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">部位別カラー</h3>
          <div className="flex flex-wrap gap-3">
            {PART_OPTIONS.map(part => (
              <div key={part.label} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: part.color}}></div>
                <span className="text-sm text-slate-600">{part.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* 分析タイプ切り替え（ダッシュボード時のみ） */}
      {subView === 'dashboard' && (
        <div className="flex bg-slate-200 rounded-lg p-1">
          <button
            onClick={() => setAnalysisType('volume')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
              analysisType === 'volume' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'
            }`}
          >
            ボリューム基準
          </button>
          <button
            onClick={() => setAnalysisType('reps')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
              analysisType === 'reps' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'
            }`}
          >
            回数基準
          </button>
        </div>
      )}
      {/* 月間ダッシュボード */}
      {subView === 'dashboard' && (
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-6">
          {/* 月選択ヘッダー */}
          <div className="flex justify-between items-center">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              &lt;
            </button>
            <h2 className="font-bold text-lg">
              {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
            </h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              &gt;
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-slate-600">読み込み中...</div>
          ) : monthlyStats && chartData ? (
            <>
              {/* 統計サマリー */}
              <div className="grid grid-cols-2 gap-4">
                <StatsCard title="トレーニング日数" value={monthlyStats.trainingDays} unit="日" />
                <StatsCard title="総セット数" value={monthlyStats.totalSets} unit="回" />
                <StatsCard title="総ボリューム" value={monthlyStats.totalVolume} unit="kg" />
                <StatsCard title="総レップ数" value={monthlyStats.totalReps} unit="回" />
              </div>

              {/* 部位別チャート */}
              {chartData.pieData.length > 0 ? (
                <PartPieChart
                  data={chartData.pieData}
                  title={analysisType === 'volume' ? '部位別ボリューム' : '部位別レップ数'}
                />
              ) : (
                <div className="text-center py-8 text-slate-500">この月の記録はありません</div>
              )}

              {/* 月間推移 */}
              {chartData.trendData.length > 0 && (
                <div className="space-y-4">
                  <MonthlyTrendBarChart
                    data={chartData.trendData}
                    dataKeys={[
                      {key: 'trainingDays', name: 'トレーニング日数', color: '#0088FE'},
                      {key: 'totalSets', name: '総セット数', color: '#00C49F'},
                    ]}
                    title="トレーニング頻度の推移"
                  />

                  {analysisType === 'volume' ? (
                    <MonthlyTrendBarChart
                      data={chartData.trendData}
                      dataKeys={[{key: 'totalVolume', name: '総ボリューム', color: '#FFBB28'}]}
                      title="総ボリュームの推移"
                    />
                  ) : (
                    <MonthlyTrendBarChart
                      data={chartData.trendData}
                      dataKeys={[{key: 'totalReps', name: '総レップ数', color: '#FF8042'}]}
                      title="総レップ数の推移"
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">データがありません</div>
          )}
        </div>
      )}
      {/* 種目別分析 */}
      {subView === 'exercise' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white p-4 rounded-lg shadow-sm text-center py-8 text-slate-600">読み込み中...</div>
          ) : Object.keys(exerciseChartData).length > 0 ? (
            groupedMasters.sortedParts.map(part => {
              const partExercises = groupedMasters.grouped[part].filter(master => exerciseChartData[master.id])
              const partColor = PART_OPTIONS.find(p => p.label === part)?.color || '#636E72'

              if (partExercises.length === 0) return null

              return (
                <div key={part} className="bg-white p-4 rounded-lg shadow-sm border-l-4" style={{borderLeftColor: partColor}}>
                  <h2 className="font-bold text-xl text-center mb-4" style={{color: partColor}}>
                    {part}
                  </h2>
                  <div className="space-y-6">
                    {partExercises.map(master => {
                      const data = exerciseChartData[master.id]
                      if (!data?.chartData?.length) return null

                      return (
                        <div key={master.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: partColor}}></div>
                            {master.name}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ExerciseProgressLineChart
                              data={data.chartData}
                              dataKeys={[{key: 'totalVolume', name: 'ボリューム', color: partColor}]}
                              title="トレーニングボリューム"
                              unit={master.unit}
                            />
                            <ExerciseProgressLineChart
                              data={data.chartData}
                              dataKeys={[{key: 'maxStrength', name: '最大重量', color: partColor}]}
                              title="最大挙上重量"
                              unit={master.unit}
                            />
                            <ExerciseProgressLineChart
                              data={data.chartData}
                              dataKeys={[{key: 'totalReps', name: 'レップ数', color: partColor}]}
                              title="合計レップ数"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-sm text-center py-8 text-slate-500">種目の記録データがありません</div>
          )}
        </div>
      )}
    </div>
  )
}
