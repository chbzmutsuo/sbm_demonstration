'use client'

import React from 'react'

interface ExerciseSummary {
  exercise: {
    id: number
    part: string
    name: string
    unit: string
  }
  totalSessions: number
  totalVolume: number
  maxStrength: number
  maxReps: number
  avgStrength: number
  avgReps: number
  lastWorkout: Date | null
}

interface ExerciseSummaryCardProps {
  summary: ExerciseSummary
  onClick: () => void
}

export function ExerciseSummaryCard({summary, onClick}: ExerciseSummaryCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {month: 'short', day: 'numeric'})
  }

  const getPartColor = (part: string) => {
    const colors = {
      胸: 'bg-red-100 text-red-800',
      背中: 'bg-blue-100 text-blue-800',
      肩: 'bg-green-100 text-green-800',
      腕: 'bg-purple-100 text-purple-800',
      足: 'bg-orange-100 text-orange-800',
      有酸素: 'bg-cyan-100 text-cyan-800',
    }
    return colors[part as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div
      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPartColor(summary.exercise.part)}`}>
              {summary.exercise.part}
            </span>
            <span className="text-xs text-slate-500">{summary.exercise.unit}</span>
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">{summary.exercise.name}</h4>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">{summary.totalSessions}</div>
          <div className="text-xs text-slate-500">セッション</div>
        </div>
      </div>

      {/* メトリクス */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="text-sm font-medium text-slate-700">最大強度</div>
          <div className="text-lg font-bold text-green-600">
            {summary.maxStrength}
            <span className="text-xs text-slate-500 ml-1">{summary.exercise.unit}</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-slate-700">最大回数</div>
          <div className="text-lg font-bold text-purple-600">
            {summary.maxReps}
            <span className="text-xs text-slate-500 ml-1">回</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="text-sm font-medium text-slate-700">平均強度</div>
          <div className="text-sm font-semibold text-slate-600">
            {summary.avgStrength}
            <span className="text-xs text-slate-500 ml-1">{summary.exercise.unit}</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-slate-700">平均回数</div>
          <div className="text-sm font-semibold text-slate-600">
            {summary.avgReps}
            <span className="text-xs text-slate-500 ml-1">回</span>
          </div>
        </div>
      </div>

      {/* ボリュームと最終トレーニング */}
      <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">総ボリューム</div>
            <div className="text-sm font-semibold text-slate-700">{summary.totalVolume.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">最終トレーニング</div>
            <div className="text-sm font-medium text-slate-600">
              {summary.lastWorkout ? formatDate(summary.lastWorkout) : 'なし'}
            </div>
          </div>
        </div>
      </div>

      {/* クリックヒント */}
      <div className="mt-3 text-center">
        <div className="text-xs text-blue-600 font-medium">詳細を見る →</div>
      </div>
    </div>
  )
}
