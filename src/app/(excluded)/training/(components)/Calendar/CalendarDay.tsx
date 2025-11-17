'use client'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import React from 'react'
import {Center} from '@cm/components/styles/common-components/common-components'
import {cn} from '@cm/shadcn/lib/utils'
import {Days} from '@cm/class/Days/Days'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {PART_OPTIONS} from '@app/(excluded)/training/(constants)/PART_OPTIONS'

interface CalendarDayProps {
  date: Date
  onDateClick: (dateStr: string) => void
  workoutData?: {
    totalSets: number
    exerciseCount: number
    partSummary: {
      part: string
      count: number
    }[]
  }
}

const wrapperWidth = 32
export function CalendarDay({date, onDateClick, workoutData}: CalendarDayProps) {
  // 日付が存在しない場合（前月・次月の空セル）
  if (date === null) {
    return <div className="w-8 h-8" />
  }
  const day = date.getDate()

  // クリック可能な日付セル
  const handleClick = () => {
    const dateStr = formatDate(date)
    onDateClick(dateStr)
  }

  const isToday = Days.validate.isSameDate(date, getMidnight())

  // 部位別記録の塗りつぶし表示を生成
  const renderPartFill = () => {
    if (!workoutData || !workoutData.partSummary || workoutData.partSummary.length === 0) {
      return (
        <svg
          width={wrapperWidth}
          height={wrapperWidth}
          viewBox={`0 0 ${wrapperWidth} ${wrapperWidth}`}
          className="absolute inset-0"
        >
          <circle
            cx={wrapperWidth / 2}
            cy={wrapperWidth / 2}
            r={wrapperWidth / 2 - 0.5}
            fill={isToday ? '#FFD600' : '#D1D5DB'} // 記録なしは薄いグレー、今日は黄色
            stroke="#fff"
            strokeWidth="0.3"
          />
        </svg>
      )
    }

    // 部位ごとのセット数を円グラフで表示
    const totalSets = workoutData.totalSets
    let currentAngle = 0

    return (
      <svg
        width={wrapperWidth}
        height={wrapperWidth}
        viewBox={`0 0 ${wrapperWidth} ${wrapperWidth}`}
        className="absolute inset-0"
      >
        {workoutData.partSummary.length === 1 ? (
          // 1つの部位のみの場合は円全体を塗りつぶし
          <circle
            cx={wrapperWidth / 2}
            cy={wrapperWidth / 2}
            r={wrapperWidth / 2 - 0.5}
            fill={isToday ? '#FFD600' : PART_OPTIONS.find(p => p.value === workoutData.partSummary[0].part)?.color || '#636E72'}
            stroke="#fff"
            strokeWidth="0.3"
          />
        ) : (
          // 複数の部位がある場合は扇形で塗りつぶし
          workoutData.partSummary.map((item, index) => {
            const partColor = PART_OPTIONS.find(p => p.value === item.part)?.color || '#636E72'
            const percentage = item.count / totalSets
            const angle = percentage * 360
            const largeArcFlag = angle > 180 ? 1 : 0

            // 中心点
            const centerX = wrapperWidth / 2
            const centerY = wrapperWidth / 2
            const radius = wrapperWidth / 2 - 0.5 // ボーダーを最小限に

            // SVGパスを計算（扇形を描画）
            const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180)
            const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180)
            const x2 = centerX + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180)
            const y2 = centerY + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180)

            const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

            currentAngle += angle

            return <path key={index} d={path} fill={isToday ? '#FFD600' : partColor} stroke="#fff" strokeWidth="0.3" />
          })
        )}

        {/* 種目数を表示するテキスト */}
        {workoutData.exerciseCount > 1 && (
          <text
            x={wrapperWidth / 2}
            y={wrapperWidth / 2 + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize="8"
            fontWeight="bold"
          >
            {workoutData.exerciseCount}
          </text>
        )}
      </svg>
    )
  }

  return (
    <Center
      className="relative cursor-pointer rounded-full hover:scale-105 transition-transform"
      style={{width: wrapperWidth, height: wrapperWidth}}
      onClick={handleClick}
    >
      {renderPartFill()}
      <span className="relative z-10 text-sm font-semibold drop-shadow-sm">
        <div className={cn(workoutData ? 'text-white' : 'text-black', 'text-center')}>{day}</div>
      </span>
    </Center>
  )
}
