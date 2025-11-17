'use client'

import React, {useState, useEffect, useMemo} from 'react'
import {ExerciseMaster, WorkoutLogWithMaster} from '../../types/training'

import {PerformanceChart} from '../Log/PerformanceChart'
import {StrengthProgressChart} from './StrengthProgressChart'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getExerciseProgressData} from '@app/(excluded)/training/server-actions/analysis-data'

interface ExerciseAnalysisProps {
  userId: number
  exerciseId: number
  masters: ExerciseMaster[]
  onBack: () => void
}

export function ExerciseAnalysis({userId, exerciseId, masters, onBack}: ExerciseAnalysisProps) {
  const [logList, setlogList] = useState<WorkoutLogWithMaster[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y'>('3m')

  const exercise = masters.find(m => m.id === exerciseId)

  // 期間に応じた月数を取得
  const getMonthCount = (period: string) => {
    switch (period) {
      case '3m':
        return 3
      case '6m':
        return 6
      case '1y':
        return 12
      default:
        return 3
    }
  }

  // 種目の記録を取得
  const fetchExerciselogList = async () => {
    if (!userId || !exerciseId) return

    setIsLoading(true)
    try {
      const result = await getExerciseProgressData(userId, exerciseId, getMonthCount(selectedPeriod))
      if (result.result) {
        setlogList(result.result)
      }
    } catch (error) {
      console.error('種目記録の取得に失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExerciselogList()
  }, [userId, exerciseId, selectedPeriod])

  // パフォーマンス指標を計算
  const performanceMetrics = useMemo(() => {
    if (!logList.length) return null

    const sortedlogList = [...logList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // 最大値
    const maxStrength = Math.max(...logList.map(log => log.strength))
    const maxReps = Math.max(...logList.map(log => log.reps))
    const maxVolume = Math.max(...logList.map(log => log.strength * log.reps))

    // 平均値
    const avgStrength = logList.reduce((sum, log) => sum + log.strength, 0) / logList.length
    const avgReps = logList.reduce((sum, log) => sum + log.reps, 0) / logList.length
    const avgVolume = logList.reduce((sum, log) => sum + log.strength * log.reps, 0) / logList.length

    // 推定1RM（Epley式）
    const estimated1RM =
      logList.reduce((sum, log) => {
        if (log.reps > 0) {
          const epley = log.strength * (1 + log.reps / 30)
          return sum + epley
        }
        return sum
      }, 0) / logList.length

    // トレーニング頻度
    const uniqueDates = new Set(logList.map(log => new Date(log.date).toDateString()))
    const trainingFrequency = uniqueDates.size

    // 進歩率（最初と最後の記録を比較）
    const firstLog = sortedlogList[0]
    const lastLog = sortedlogList[sortedlogList.length - 1]
    const strengthProgress = lastLog && firstLog ? ((lastLog.strength - firstLog.strength) / firstLog.strength) * 100 : 0

    return {
      maxStrength: Math.round(maxStrength * 10) / 10,
      maxReps: Math.round(maxReps * 10) / 10,
      maxVolume: Math.round(maxVolume * 10) / 10,
      avgStrength: Math.round(avgStrength * 10) / 10,
      avgReps: Math.round(avgReps * 10) / 10,
      avgVolume: Math.round(avgVolume * 10) / 10,
      estimated1RM: Math.round(estimated1RM * 10) / 10,
      trainingFrequency,
      strengthProgress: Math.round(strengthProgress * 10) / 10,
      totalSessions: logList.length,
    }
  }, [logList])

  // 週別データを作成
  const weeklyData = useMemo(() => {
    if (!logList.length) return []

    const weeklyMap = new Map<string, {strength: number; reps: number; volume: number; count: number}>()

    logList.forEach(log => {
      const date = new Date(log.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // 日曜日を週の開始とする
      const weekKey = formatDate(weekStart, 'YYYY-MM-DD')

      const existing = weeklyMap.get(weekKey) || {strength: 0, reps: 0, volume: 0, count: 0}
      existing.strength += log.strength
      existing.reps += log.reps
      existing.volume += log.strength * log.reps
      existing.count += 1

      weeklyMap.set(weekKey, existing)
    })

    return Array.from(weeklyMap.entries())
      .map(([week, data]) => ({
        week,
        avgStrength: Math.round((data.strength / data.count) * 10) / 10,
        avgReps: Math.round((data.reps / data.count) * 10) / 10,
        totalVolume: data.volume,
        sessions: data.count,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
  }, [logList])

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">種目が見つかりません</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">
          ダッシュボードに戻る
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div>
          <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700 mb-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ダッシュボードに戻る
          </button>
          <h2 className="text-xl font-semibold text-slate-800">{exercise.name}の分析</h2>
          <div className="flex items-center space-x-2 mt-1">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                exercise.part === '胸'
                  ? 'bg-red-100 text-red-800'
                  : exercise.part === '背中'
                    ? 'bg-blue-100 text-blue-800'
                    : exercise.part === '肩'
                      ? 'bg-green-100 text-green-800'
                      : exercise.part === '腕'
                        ? 'bg-purple-100 text-purple-800'
                        : exercise.part === '足'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-cyan-100 text-cyan-800'
              }`}
            >
              {exercise.part}
            </span>
            <span className="text-sm text-slate-600">単位: {exercise.unit}</span>
          </div>
        </div>

        {/* 期間選択 */}
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
          {(['3m', '6m', '1y'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {period === '3m' ? '3ヶ月' : period === '6m' ? '6ヶ月' : '1年'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">読み込み中...</div>
        </div>
      ) : (
        <>
          {/* パフォーマンス指標 */}
          {performanceMetrics && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">パフォーマンス指標</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{performanceMetrics.maxStrength}</div>
                  <div className="text-sm text-slate-600">最大強度 ({exercise.unit})</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{performanceMetrics.maxReps}</div>
                  <div className="text-sm text-slate-600">最大回数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{performanceMetrics.estimated1RM}</div>
                  <div className="text-sm text-slate-600">推定1RM ({exercise.unit})</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{performanceMetrics.trainingFrequency}</div>
                  <div className="text-sm text-slate-600">トレーニング日数</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-700">{performanceMetrics.avgStrength}</div>
                  <div className="text-sm text-slate-600">平均強度 ({exercise.unit})</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-700">{performanceMetrics.avgReps}</div>
                  <div className="text-sm text-slate-600">平均回数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-700">{performanceMetrics.avgVolume}</div>
                  <div className="text-sm text-slate-600">平均ボリューム</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-lg font-semibold ${
                      performanceMetrics.strengthProgress >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {performanceMetrics.strengthProgress >= 0 ? '+' : ''}
                    {performanceMetrics.strengthProgress}%
                  </div>
                  <div className="text-sm text-slate-600">強度進歩率</div>
                </div>
              </div>
            </div>
          )}

          {/* 週別進歩チャート */}
          {weeklyData.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">週別進歩</h3>
              <StrengthProgressChart data={weeklyData} exercise={exercise} />
            </div>
          )}

          {/* パフォーマンスチャート（既存のコンポーネントを再利用） */}
          {logList.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">詳細分析</h3>
              <PerformanceChart
                {...{
                  logList,
                  // exerciseId,
                  // userId,
                  // unit: exercise.unit,
                }}
              />
            </div>
          )}

          {/* 記録がない場合 */}
          {logList.length === 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-slate-500">選択した期間の記録がありません</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
