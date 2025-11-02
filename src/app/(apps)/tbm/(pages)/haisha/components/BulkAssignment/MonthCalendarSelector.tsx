'use client'
import React, {useState, useEffect} from 'react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Days} from '@cm/class/Days/Days'
import {cn} from '@cm/shadcn/lib/utils'
import {TbmRouteGroupWithCalendar} from '../../types/haisha-page-types'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {TbmVehicle, User} from '@prisma/client'
import {Trash2Icon} from 'lucide-react'

// 既存のスケジュール情報の型定義
interface ExistingSchedule {
  id: number
  date: Date
  userId: number | null
  tbmVehicleId: number | null
  User: User | null
  TbmVehicle: TbmVehicle | null
}

interface MonthCalendarSelectorProps {
  month: Date
  selectedDates: Date[]
  onDateSelect: (dates: Date[]) => void
  tbmRouteGroup: TbmRouteGroupWithCalendar
  onDeleteSchedule?: (scheduleId: number) => Promise<void>
  refreshTrigger?: number // 再取得をトリガーするための値
}

export const MonthCalendarSelector: React.FC<MonthCalendarSelectorProps> = ({
  month,
  selectedDates,
  onDateSelect,
  tbmRouteGroup,
  onDeleteSchedule,
  refreshTrigger = 0,
}) => {
  const [calendarDays, setCalendarDays] = useState<Date[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<Date | null>(null)
  const [existingSchedules, setExistingSchedules] = useState<ExistingSchedule[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 月のカレンダー日付を生成
  useEffect(() => {
    const {days, getWeeks} = Days.month.getMonthDatum(month)

    const weeks = getWeeks('月')

    setCalendarDays(days)
  }, [month])

  // 既存のスケジュールを取得
  useEffect(() => {
    const fetchExistingSchedules = async () => {
      if (!tbmRouteGroup?.id) return

      setIsLoading(true)
      try {
        // 月の開始日と終了日
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1)
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0)

        const {result} = await doStandardPrisma('tbmDriveSchedule', 'findMany', {
          where: {
            tbmRouteGroupId: tbmRouteGroup.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            User: true,
            TbmVehicle: true,
          },
        })

        if (result) {
          setExistingSchedules(result)
        }
      } catch (error) {
        console.error('既存のスケジュール取得エラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExistingSchedules()
  }, [tbmRouteGroup?.id, month, refreshTrigger]) // refreshTriggerを依存配列に追加

  // 日付が選択されているかチェック
  const isDateSelected = (date: Date) => {
    return selectedDates.some(selectedDate => formatDate(selectedDate, 'YYYY-MM-DD') === formatDate(date, 'YYYY-MM-DD'))
  }

  // 委託パターン設定がされているかチェック
  const hasRouteGroupCalendar = (date: Date) => {
    return tbmRouteGroup.TbmRouteGroupCalendar.some(calendar => {
      return calendar.holidayType === '稼働' && formatDate(calendar.date, 'YYYY-MM-DD') === formatDate(date, 'YYYY-MM-DD')
    })
  }

  // 指定した日付の既存スケジュールを取得
  const getExistingSchedule = (date: Date) => {
    return existingSchedules.find(schedule => formatDate(schedule.date, 'YYYY-MM-DD') === formatDate(date, 'YYYY-MM-DD'))
  }

  // 指定した日付に既存のスケジュールがあるかチェック
  const hasExistingSchedule = (date: Date) => {
    return !!getExistingSchedule(date)
  }

  // 日付クリック時の処理
  const handleDateClick = (date: Date) => {
    if (isSelecting) {
      // 選択終了
      setIsSelecting(false)
      if (selectionStart) {
        const startTime = selectionStart.getTime()
        const endTime = date.getTime()

        // 開始日と終了日を正しい順序に並べる
        const start = Math.min(startTime, endTime)
        const end = Math.max(startTime, endTime)

        // 選択範囲内の日付を全て取得
        const newSelectedDates = calendarDays.filter(day => {
          const time = day.getTime()
          return time >= start && time <= end
        })

        // 既存の選択と結合
        const combinedSelection = [...selectedDates]

        // 新しく選択した日付を追加（重複を避ける）
        newSelectedDates.forEach(newDate => {
          const newDateStr = formatDate(newDate, 'YYYY-MM-DD')
          const exists = combinedSelection.some(date => formatDate(date, 'YYYY-MM-DD') === newDateStr)

          if (!exists) {
            combinedSelection.push(newDate)
          }
        })

        onDateSelect(combinedSelection)
      }
      setSelectionStart(null)
    } else {
      // 選択開始
      setIsSelecting(true)
      setSelectionStart(date)

      // Ctrlキーが押されていない場合は単一選択
      const isDateAlreadySelected = isDateSelected(date)

      if (isDateAlreadySelected) {
        // 既に選択されている場合は選択解除
        const newSelectedDates = selectedDates.filter(
          selectedDate => formatDate(selectedDate, 'YYYY-MM-DD') !== formatDate(date, 'YYYY-MM-DD')
        )
        onDateSelect(newSelectedDates)
      } else {
        // 選択追加
        onDateSelect([...selectedDates, date])
      }

      // 単一選択の場合は選択モードを終了
      setIsSelecting(false)
    }
  }

  // 一括選択/解除
  const handleSelectAll = () => {
    if (selectedDates.length === calendarDays.length) {
      // 全て選択されている場合は全解除
      onDateSelect([])
    } else {
      // 全選択
      onDateSelect([...calendarDays])
    }
  }

  // 曜日ヘッダー
  const weekdays = ['月', '火', '水', '木', '金', '土', '日']

  // 既存スケジュール情報の表示用コンポーネント
  const ScheduleInfo = ({schedule}: {schedule: ExistingSchedule}) => {
    // 削除ボタンのクリックハンドラ
    const handleDeleteClick = async (e: React.MouseEvent) => {
      e.stopPropagation() // カレンダー日付のクリックイベントを発火させない

      if (!onDeleteSchedule) return

      if (confirm(`この日のスケジュールを削除しますか？`)) {
        try {
          await onDeleteSchedule(schedule.id)
        } catch (error) {
          console.error('スケジュール削除エラー:', error)
        }
      }
    }

    return (
      <div className="text-xs mt-1 overflow-hidden w-full">
        {schedule.User && <div className="truncate font-medium text-gray-700">{schedule.User.name}</div>}
        {schedule.TbmVehicle && <div className="truncate text-gray-500">{schedule.TbmVehicle.vehicleNumber}</div>}

        {onDeleteSchedule && (
          <span
            onClick={handleDeleteClick}
            className="mt-1 text-red-500 hover:text-red-700 flex items-center justify-center w-full"
            title="削除する"
          >
            <Trash2Icon size={14} className="mr-1" />
            <span>削除</span>
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-bold">{formatDate(month, 'YYYY年MM月')}</h3>
        <button type="button" onClick={handleSelectAll} className="text-sm text-blue-600 hover:underline">
          {selectedDates.length === calendarDays.length ? '全て解除' : '全て選択'}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* 曜日ヘッダー */}
        {weekdays.map((day, i) => (
          <div
            key={`weekday-${i}`}
            className={cn(
              'text-center py-2 font-medium text-base',
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-700'
            )}
          >
            {day}
          </div>
        ))}

        {/* カレンダー日付 */}
        {/* 月曜始まりカレンダーに対応 */}
        {(() => {
          const weeks = Days.month.getMonthDatum(month).getWeeks('月')
          // 月曜始まりにする: calendarDays を週ごと（月曜→日曜）に分割

          return weeks.map((daysInWeek, rowIdx) =>
            daysInWeek.map((date, colIdx) => {
              if (!date) {
                return <div key={`empty-${rowIdx}-${colIdx}`} className="p-2 min-h-16" />
              }
              const isSelected = isDateSelected(date)
              const hasCalendar = hasRouteGroupCalendar(date)
              const existingSchedule = getExistingSchedule(date)
              const hasSchedule = !!existingSchedule

              // 月曜始まりなので曜日変換
              // colIdx: 0(月), 1(火), ..., 6(日)
              // 曜日ラベル: ['月', '火', '水', '木', '金', '土', '日']
              // let dayOfWeek = date.getDay() // JS: 0=日, 1=月...
              // カレンダー上のカラムindex: colIdx

              const isInMonth = Days.validate.isSameMonth(date, month)
              if (!isInMonth) {
                return (
                  <div key={`empty-${rowIdx}-${colIdx}`} className="p-2 min-h-16">
                    <div className="text-gray-500">{formatDate(date, 'D(ddd)')}</div>
                  </div>
                )
              }

              return (
                <button
                  key={`day-${rowIdx}-${colIdx}`}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    'text-center p-2 rounded-md relative flex flex-col items-center min-h-16',
                    isSelected ? 'bg-blue-500 text-white' : 'bg-white',
                    hasCalendar ? 'bg-yellow-100' : '',
                    isSelected && hasCalendar ? 'bg-blue-400' : '',
                    hasSchedule && !isSelected ? 'bg-green-100' : '',
                    hasSchedule && isSelected ? 'bg-green-400' : '',
                    'hover:bg-blue-100 transition-colors border'
                  )}
                >
                  <div
                    className={cn(
                      'font-bold text-base',
                      // colIdx: 0(月)=gray, 5(土)=blue, 6(日)=red
                      colIdx === 6 ? 'text-red-500' : colIdx === 5 ? 'text-blue-500' : 'text-gray-700',
                      isSelected ? 'text-white' : ''
                    )}
                  >
                    {date.getDate()}
                  </div>
                  {/* 既存スケジュール情報の表示 */}
                  {hasSchedule && existingSchedule && <ScheduleInfo schedule={existingSchedule} />}
                </button>
              )
            })
          )
        })()}
      </div>

      <div className="mt-4 text-sm grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-yellow-100 mr-2 border border-gray-300"></span>
          <span>委託パターン設定あり</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-green-100 mr-2 border border-gray-300"></span>
          <span>スケジュール登録済み</span>
        </div>
      </div>
    </div>
  )
}
