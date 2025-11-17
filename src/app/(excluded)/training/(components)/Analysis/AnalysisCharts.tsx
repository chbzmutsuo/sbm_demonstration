'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import useRecharts from '@cm/hooks/useRecharts'
import {PART_OPTIONS} from '@app/(excluded)/training/(constants)/PART_OPTIONS'

// 色パレット
const COLORS = PART_OPTIONS.map(part => part.color)

// 部位別円グラフ
interface PartPieChartProps {
  data: Array<{name: string; value: number; color?: string}>
  title: string
}

export function PartPieChart({data, title}: PartPieChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500">データがありません</div>
  }

  return (
    <div className="h-64">
      <h4 className="text-center font-semibold mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({name, percent}) => `${name} ${(percent * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value.toLocaleString(), '値']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// 月間推移棒グラフ
interface MonthlyTrendBarChartProps {
  data: Array<{name: string; [key: string]: any}>
  dataKeys: Array<{key: string; name: string; color?: string}>
  title: string
}

export function MonthlyTrendBarChart({data, dataKeys, title}: MonthlyTrendBarChartProps) {
  const {
    style: {chartDefaultStyle},
  } = useRecharts()

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500">データがありません</div>
  }

  return (
    <div className="h-64">
      <h4 className="text-center font-semibold mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={chartDefaultStyle.margin}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={60} />
          <YAxis fontSize={12} />
          <Tooltip formatter={(value: number, name: string) => [value.toLocaleString(), name]} />
          <Legend />
          {dataKeys.map((item, index) => (
            <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color || COLORS[index % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// 種目進捗折れ線グラフ
interface ExerciseProgressLineChartProps {
  data: Array<{date: string; [key: string]: any}>
  dataKeys: Array<{key: string; name: string; color?: string}>
  title: string
  unit?: string
}

export function ExerciseProgressLineChart({data, dataKeys, title, unit}: ExerciseProgressLineChartProps) {
  const {
    style: {chartDefaultStyle},
  } = useRecharts()

  if (!data || data.length < 2) {
    return <div className="h-48 flex items-center justify-center text-slate-500 text-sm">表示するには2日以上の記録が必要です</div>
  }

  // 日付フォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const formattedData = data.map(item => ({
    ...item,
    shortDate: formatDate(item.date),
  }))

  return (
    <div className="h-48">
      <h4 className="text-center font-semibold mb-1 text-sm">
        {title} {unit && `(${unit})`}
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{top: 5, right: 20, left: 5, bottom: 20}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="shortDate" fontSize={10} interval="preserveStartEnd" />
          <YAxis fontSize={10} />
          <Tooltip
            labelFormatter={label => `日付: ${label}`}
            formatter={(value: number, name: string) => [value.toLocaleString() + (unit ? ` ${unit}` : ''), name]}
          />
          {dataKeys.map((item, index) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stroke={item.color || COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{r: 3}}
              activeDot={{r: 5}}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// 複合チャート（ボリュームと回数を同時表示）
interface CombinedChartProps {
  data: Array<{name: string; [key: string]: any}>
  leftDataKey: string
  rightDataKey: string
  leftName: string
  rightName: string
  title: string
}

export function CombinedChart({data, leftDataKey, rightDataKey, leftName, rightName, title}: CombinedChartProps) {
  const {
    style: {chartDefaultStyle},
  } = useRecharts()

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500">データがありません</div>
  }

  return (
    <div className="h-64">
      <h4 className="text-center font-semibold mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={chartDefaultStyle.margin}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={60} />
          <YAxis yAxisId="left" fontSize={12} />
          <YAxis yAxisId="right" orientation="right" fontSize={12} />
          <Tooltip formatter={(value: number, name: string) => [value.toLocaleString(), name]} />
          <Legend />
          <Bar yAxisId="left" dataKey={leftDataKey} name={leftName} fill={COLORS[0]} />
          <Bar yAxisId="right" dataKey={rightDataKey} name={rightName} fill={COLORS[1]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// 簡易統計カード
interface StatsCardProps {
  title: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  className?: string
}

export function StatsCard({title, value, unit, trend, className = ''}: StatsCardProps) {
  const trendIcon = {
    up: '↗️',
    down: '↘️',
    stable: '→',
  }

  return (
    <div className={`bg-slate-100 p-3 rounded-lg text-center ${className}`}>
      <p className="text-sm text-slate-600">{title}</p>
      <p className="text-2xl font-bold flex items-center justify-center gap-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-base font-normal">{unit}</span>}
        {trend && <span className="text-lg">{trendIcon[trend]}</span>}
      </p>
    </div>
  )
}
