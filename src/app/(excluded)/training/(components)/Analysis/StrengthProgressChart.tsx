'use client'

import React from 'react'
import {ExerciseMaster} from '../../types/training'

interface WeeklyData {
  week: string
  avgStrength: number
  avgReps: number
  totalVolume: number
  sessions: number
}

interface StrengthProgressChartProps {
  data: WeeklyData[]
  exercise: ExerciseMaster
}

export function StrengthProgressChart({data, exercise}: StrengthProgressChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-slate-500">データがありません</div>
  }

  const chartHeight = 200
  const chartWidth = Math.max(600, data.length * 40)

  // 強度とボリュームの最大値を取得
  const maxStrength = Math.max(...data.map(d => d.avgStrength))
  const maxVolume = Math.max(...data.map(d => d.totalVolume))

  // 週の表示を短縮
  const formatWeek = (weekStr: string) => {
    const date = new Date(weekStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <svg width={chartWidth} height={chartHeight + 80} className="w-full">
          {/* Y軸ラベル（強度） */}
          <g className="text-xs text-slate-500">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = chartHeight - ratio * chartHeight + 20
              const value = Math.round(maxStrength * ratio)
              return (
                <g key={i}>
                  <line x1={40} y1={y} x2={chartWidth - 20} y2={y} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="2,2" />
                  <text x={35} y={y + 4} textAnchor="end" className="fill-slate-500">
                    {value}
                  </text>
                </g>
              )
            })}
          </g>

          {/* X軸 */}
          <line x1={40} y1={chartHeight + 20} x2={chartWidth - 20} y2={chartHeight + 20} stroke="#94a3b8" strokeWidth={2} />

          {/* Y軸 */}
          <line x1={40} y1={20} x2={40} y2={chartHeight + 20} stroke="#94a3b8" strokeWidth={2} />

          {/* 強度のライン（青） */}
          {data.map((item, index) => {
            const x = 60 + (index * (chartWidth - 80)) / (data.length - 1)
            const y = chartHeight - (item.avgStrength / maxStrength) * chartHeight + 20

            return (
              <g key={`strength-${index}`}>
                {/* データポイント */}
                <circle cx={x} cy={y} r={4} fill="#3b82f6" className="hover:fill-blue-700 transition-colors cursor-pointer" />

                {/* ツールチップ用の透明な領域 */}
                <circle cx={x} cy={y} r={8} fill="transparent" className="cursor-pointer" />

                {/* X軸ラベル */}
                <text x={x} y={chartHeight + 40} textAnchor="middle" className="text-xs fill-slate-600">
                  {formatWeek(item.week)}
                </text>

                {/* 前のポイントとのライン */}
                {index > 0 && (
                  <line
                    x1={60 + ((index - 1) * (chartWidth - 80)) / (data.length - 1)}
                    y1={chartHeight - (data[index - 1].avgStrength / maxStrength) * chartHeight + 20}
                    x2={x}
                    y2={y}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    className="transition-all duration-200"
                  />
                )}
              </g>
            )
          })}

          {/* ボリュームのバー（緑） */}
          {data.map((item, index) => {
            const x = 60 + (index * (chartWidth - 80)) / (data.length - 1)
            const barHeight = (item.totalVolume / maxVolume) * (chartHeight * 0.3)
            const y = chartHeight + 20 - barHeight

            return (
              <g key={`volume-${index}`}>
                <rect
                  x={x - 8}
                  y={y}
                  width={16}
                  height={barHeight}
                  fill="#10b981"
                  opacity={0.6}
                  className="hover:opacity-100 transition-opacity cursor-pointer"
                />

                {/* ボリューム値のラベル */}
                <text x={x} y={y - 5} textAnchor="middle" className="text-xs fill-slate-600 font-medium">
                  {Math.round(item.totalVolume / 100) / 10}k
                </text>
              </g>
            )
          })}

          {/* セッション数の表示 */}
          {data.map((item, index) => {
            const x = 60 + (index * (chartWidth - 80)) / (data.length - 1)
            return (
              <g key={`sessions-${index}`}>
                <text x={x} y={chartHeight + 60} textAnchor="middle" className="text-xs fill-slate-500">
                  {item.sessions}回
                </text>
              </g>
            )
          })}

          {/* 凡例 */}
          <g className="text-sm">
            <rect x={chartWidth - 140} y={10} width={120} height={80} fill="white" stroke="#e2e8f0" rx={4} />

            {/* 強度の凡例 */}
            <line x1={chartWidth - 130} y1={30} x2={chartWidth - 110} y2={30} stroke="#3b82f6" strokeWidth={2} />
            <circle cx={chartWidth - 120} cy={30} r={4} fill="#3b82f6" />
            <text x={chartWidth - 100} y={35} className="fill-slate-700">
              平均強度
            </text>

            {/* ボリュームの凡例 */}
            <rect x={chartWidth - 130} y1={45} width={16} height={12} fill="#10b981" opacity={0.6} />
            <text x={chartWidth - 100} y={55} className="fill-slate-700">
              総ボリューム
            </text>

            {/* 単位 */}
            <text x={chartWidth - 100} y={70} className="fill-slate-500 text-xs">
              単位: {exercise.unit}
            </text>
          </g>
        </svg>
      </div>
    </div>
  )
}
