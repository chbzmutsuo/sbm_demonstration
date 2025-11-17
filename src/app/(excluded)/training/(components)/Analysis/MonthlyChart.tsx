'use client'

import React from 'react'

interface MonthlyChartProps {
  data: Array<{date: string; volume: number}>
}

export function MonthlyChart({data}: MonthlyChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-slate-500">データがありません</div>
  }

  // 最大値を取得（Y軸のスケール用）
  const maxVolume = Math.max(...data.map(d => d.volume))
  const chartHeight = 200
  const chartWidth = Math.max(600, data.length * 30)

  // 日付を短縮表示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <svg width={chartWidth} height={chartHeight + 60} className="w-full">
          {/* Y軸ラベル */}
          <g className="text-xs text-slate-500">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = chartHeight - ratio * chartHeight + 20
              const value = Math.round(maxVolume * ratio)
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

          {/* データポイントとライン */}
          {data.map((item, index) => {
            const x = 60 + (index * (chartWidth - 80)) / (data.length - 1)
            const y = chartHeight - (item.volume / maxVolume) * chartHeight + 20

            return (
              <g key={index}>
                {/* データポイント */}
                <circle cx={x} cy={y} r={4} fill="#3b82f6" className="hover:fill-blue-700 transition-colors cursor-pointer" />

                {/* ツールチップ用の透明な領域 */}
                <circle cx={x} cy={y} r={8} fill="transparent" className="cursor-pointer" />

                {/* X軸ラベル */}
                <text x={x} y={chartHeight + 40} textAnchor="middle" className="text-xs fill-slate-600">
                  {formatDate(item.date)}
                </text>

                {/* 前のポイントとのライン */}
                {index > 0 && (
                  <line
                    x1={60 + ((index - 1) * (chartWidth - 80)) / (data.length - 1)}
                    y1={chartHeight - (data[index - 1].volume / maxVolume) * chartHeight + 20}
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

          {/* 凡例 */}
          <g className="text-sm">
            <rect x={chartWidth - 120} y={10} width={100} height={60} fill="white" stroke="#e2e8f0" rx={4} />
            <line x1={chartWidth - 110} y1={30} x2={chartWidth - 90} y2={30} stroke="#3b82f6" strokeWidth={2} />
            <circle cx={chartWidth - 100} cy={30} r={4} fill="#3b82f6" />
            <text x={chartWidth - 80} y={35} className="fill-slate-700">
              トレーニングボリューム
            </text>
            <text x={chartWidth - 80} y={50} className="fill-slate-500 text-xs">
              （強度 × 回数）
            </text>
          </g>
        </svg>
      </div>
    </div>
  )
}
