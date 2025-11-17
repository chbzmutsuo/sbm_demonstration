'use client'

import React, {useState} from 'react'
import {useRouter} from 'next/navigation'
import {CalendarDay} from './CalendarDay'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

type WorkoutData = {
  totalSets: number
  exerciseCount: number
  partSummary: {
    part: string
    count: number
  }[]
}

type WorkoutDataByDate = {
  [date: string]: WorkoutData
}

type CalendarViewProps = {
  currentDate: Date
  workoutDates: string[]
  workoutDataByDate: WorkoutDataByDate
}

export function CalendarView({currentDate, workoutDates, workoutDataByDate}: CalendarViewProps) {
  const router = useRouter()
  const [displayDate, setDisplayDate] = useState<Date>(currentDate)

  const year = displayDate.getFullYear()
  const month = displayDate.getMonth()
  const {firstDayOfMonth, lastDayOfMonth} = Days.month.getMonthDatum(displayDate)

  // 月の最初の日の曜日（0: 日曜日, 1: 月曜日, ...）
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // カレンダーに表示する日数（前月の日 + 当月の日 + 翌月の日）
  const daysInMonth = lastDayOfMonth.getDate()

  // カレンダーに表示する日付の配列を作成
  const calendarDays: Date[] = []

  // 前月の日を追加
  for (let i = 0; i < firstDayOfWeek; i++) {
    const day = new Date(year, month, -firstDayOfWeek + i + 1)
    calendarDays.push(day)
  }

  // 当月の日を追加
  for (let i = 1; i <= daysInMonth; i++) {
    const day = new Date(year, month, i)
    calendarDays.push(day)
  }

  // 翌月の日を追加（6行×7列 = 42日分になるように）
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    const day = new Date(year, month + 1, i)
    calendarDays.push(day)
  }

  // 前月へ移動
  const handlePrevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1))
  }

  // 翌月へ移動
  const handleNextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1))
  }

  // 日付クリック時の処理
  const handleDateClick = (dateStr: string) => {
    router.push(`/training/date?date=${dateStr}`)
  }

  // 曜日の表示
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="calendar">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          前月
        </button>
        <h2 className="text-xl font-bold">
          {year}年{month + 1}月
        </h2>
        <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          翌月
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day, index) => (
          <div
            key={index}
            className={`text-center py-2 font-medium ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}`}
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => {
          const dateStr = formatDate(day, 'YYYY-MM-DD')
          const workoutData = workoutDataByDate[dateStr]

          return (
            <CalendarDay
              key={index}
              {...{
                date: day,
                workoutData,
                onDateClick: () => handleDateClick(dateStr),
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
